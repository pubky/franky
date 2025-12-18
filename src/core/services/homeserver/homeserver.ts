import { PublicKey, Keypair, Capabilities, Signer, Address, resolvePubky, AuthFlowKind, Session } from '@synonymdev/pubky';

import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Config from '@/config';

import { PubkySdk } from './pubkySdk';
import { mapHomeserverError, type HomeserverErrorContext } from './homeserverErrors';

const _PKARR_RELAYS = Config.PKARR_RELAYS.split(',');
const CAPABILITIES = '/pub/pubky.app/:rw';

export class HomeserverService {
  private constructor() {}

  private static readonly SESSION_STORAGE_PREFIX = '/pub/';

  private static currentSession: Session | null = null;

  /**
   * Sets the authenticated Session used for session-scoped storage IO.
   * Controllers should call this whenever auth state changes.
   */
  static setSession(session: Session | null) {
    this.currentSession = session;
  }

  /**
   * Gets the Pubky SDK singleton.
   */
  private static getPubkySdk() {
    return PubkySdk.get();
  }

  private static getSession() {
    return this.currentSession;
  }

  private static isHttpUrl(url: string) {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  private static extractPubkyFromAddress(url: string): string | null {
    if (url.startsWith('pubky://')) {
      const rest = url.slice('pubky://'.length);
      const idx = rest.indexOf('/');
      return (idx === -1 ? rest : rest.slice(0, idx)) || null;
    }

    if (url.startsWith('pubky') && !url.startsWith('pubkyauth://')) {
      const rest = url.slice('pubky'.length);
      const idx = rest.indexOf('/');
      return (idx === -1 ? rest : rest.slice(0, idx)) || null;
    }

    if (this.isHttpUrl(url)) {
      try {
        const { hostname } = new URL(url);
        if (hostname.startsWith('_pubky.')) {
          return hostname.slice('_pubky.'.length) || null;
        }
      } catch {
        return null;
      }
    }

    return null;
  }

  private static toAbsoluteStoragePath(url: string): string | null {
    if (url.startsWith('/')) return url;

    if (url.startsWith('pubky://')) {
      const rest = url.slice('pubky://'.length);
      const idx = rest.indexOf('/');
      if (idx === -1) return null;
      return rest.slice(idx);
    }

    if (url.startsWith('pubky') && !url.startsWith('pubkyauth://')) {
      const idx = url.indexOf('/', 'pubky'.length);
      if (idx === -1) return null;
      return url.slice(idx);
    }

    if (this.isHttpUrl(url)) {
      try {
        const parsed = new URL(url);
        return parsed.pathname || null;
      } catch {
        return null;
      }
    }

    return null;
  }

  private static isSessionStoragePath(path: string): path is `/pub/${string}` {
    return path.startsWith(this.SESSION_STORAGE_PREFIX);
  }

  private static toCurrentSessionStoragePath(url: string, session: Session): `/pub/${string}` | null {
    const path = this.toAbsoluteStoragePath(url);
    if (!path) return null;
    if (!this.isSessionStoragePath(path)) return null;

    if (path.startsWith('/')) {
      // Absolute paths are implicitly session-scoped
      if (url.startsWith('/')) return path;

      const addressPubky = this.extractPubkyFromAddress(url);
      if (!addressPubky) return null;
      const sessionPubky = session.info.publicKey.z32();
      if (addressPubky !== sessionPubky) return null;
      return path;
    }

    return null;
  }

  /**
   * Gets a signer for the homeserver
   * @param keypair - The keypair to get a signer for
   * @returns The signer
   */
  private static getSigner(keypair: Keypair): Signer {
    const pubkySdk = this.getPubkySdk();
    return pubkySdk.signer(keypair);
  }

  private static throwMappedError(
    error: unknown,
    ctx: HomeserverErrorContext,
  ): never {
    throw mapHomeserverError(error, ctx);
  }

  /**
   * Checks if the keypair has a homeserver
   * @param publicKey - The public key to check
   * @returns The homeserver
   */
  private static async checkHomeserver({ publicKey }: Core.TPublicKeyParams) {
    try {
      const pubkySdk = this.getPubkySdk();
      const homeserver = await pubkySdk.getHomeserverOf(publicKey);

      if (!homeserver) {
        throw Libs.createHomeserverError(
          Libs.HomeserverErrorType.NOT_AUTHENTICATED,
          'Failed to get homeserver. Try again.',
          401,
        );
      }

      Libs.Logger.debug('Homeserver successful', { homeserver });
      return homeserver;
    } catch (error) {
      this.throwMappedError(error, {
        operation: 'checkHomeserver',
        message: 'Failed to get homeserver. Try again.',
        defaultType: Libs.HomeserverErrorType.NOT_AUTHENTICATED,
        defaultStatusCode: 401,
        details: { publicKey: publicKey?.z32?.() },
      });
    }
  }

  /**
   * Checks if the response indicates a session expiration (401 Unauthorized).
   * If so, throws a SESSION_EXPIRED error with the response message.
   */
  private static async checkSessionExpiration(response: Response, url: string): Promise<void> {
    if (response.status === 401) {
      let errorMessage = 'Session expired';
      try {
        const text = await response.text();
        if (text) {
          errorMessage = text;
        }
      } catch {
        // Ignore error reading response body
      }
      throw Libs.createHomeserverError(Libs.HomeserverErrorType.SESSION_EXPIRED, errorMessage, 401, { url });
    }
  }

  /**
   * Signs up a new user in the homeserver
   * @param keypair - The keypair to sign up with
   * @param signupToken - The signup token to use
   * @returns The session
   */
  static async signUp({ keypair, signupToken }: Core.THomeserverSignUpParams): Promise<Core.THomeserverSessionResult> {
    try {
      const homeserverPublicKey = PublicKey.from(Config.HOMESERVER);
      const signer = this.getSigner(keypair);
      const session = await signer.signup(homeserverPublicKey, signupToken);

      Libs.Logger.debug('Signup successful', { session });

      return { session };
    } catch (error) {
      this.throwMappedError(error, {
        operation: 'signup',
        message: 'Signup failed',
        defaultType: Libs.HomeserverErrorType.SIGNUP_FAILED,
        defaultStatusCode: 500,
        details: { signupTokenProvided: Boolean(signupToken) },
      });
    }
  }

  /**
   * Signs in a user to the homeserver
   * @param keypair - The keypair to sign in with
   * @returns The session
   */
  static async signIn({ keypair }: Core.TKeypairParams): Promise<Core.THomeserverSessionResult | undefined> {
    const signer = this.getSigner(keypair);
    try {
      // get homeserver from pkarr records
      await this.checkHomeserver({ publicKey: keypair.publicKey });
      const session = await signer.signin();
      return { session };
    } catch (error) {
      try {
        // Republish keypair's homeserver
        const homeserverPublicKey = PublicKey.from(Config.HOMESERVER);
        await signer.pkdns.publishHomeserverForce(homeserverPublicKey);
        Libs.Logger.debug('Republish homeserver successful', { keypair: Libs.Identity.pubkyFromKeypair(keypair) });
        // Return undefined to signal caller should retry signin after republish
        return undefined;
      } catch {
        this.throwMappedError(error, {
          operation: 'signin',
          message: 'Not authenticated. Please sign up first.',
          defaultType: Libs.HomeserverErrorType.NOT_AUTHENTICATED,
          defaultStatusCode: 401,
          details: { pubky: Libs.Identity.pubkyFromKeypair(keypair) },
        });
      }
    }
  }

  /**
   * Generates an authentication URL for the homeserver
   * @param caps - The capabilities to use
   * @returns The authentication URL and approval promise
   */
  static async generateAuthUrl(caps?: Capabilities): Promise<Core.TGenerateAuthUrlResult> {
    const capabilities: Capabilities = caps || CAPABILITIES;

    try {
      const pubkySdk = this.getPubkySdk();
      const flow = pubkySdk.startAuthFlow(capabilities, AuthFlowKind.signin(), Config.DEFAULT_HTTP_RELAY);

      return {
        authorizationUrl: flow.authorizationUrl,
        awaitApproval: flow.awaitApproval(),
        authFlow: flow,
      };
    } catch (error) {
      this.throwMappedError(error, {
        operation: 'generateAuthUrl',
        message: 'Failed to generate auth URL',
        defaultType: Libs.HomeserverErrorType.AUTH_REQUEST_FAILED,
        defaultStatusCode: 500,
        details: { capabilities, relay: Config.DEFAULT_HTTP_RELAY },
      });
    }
  }

  /**
   * Logs out a user from the homeserver
   * @param session - The authenticated Session to sign out
   * @returns Void
   */
  static async logout({ session }: Core.THomeserverSessionResult) {
    try {
      await session.signout();
    } catch (error) {
      this.throwMappedError(error, {
        operation: 'logout',
        message: 'Failed to fetch data',
        defaultType: Libs.HomeserverErrorType.FETCH_FAILED,
        defaultStatusCode: 500,
        details: { url: 'signout' },
      });
    }
  }

  private static async fetch(url: string, options?: Core.FetchOptions): Promise<Response> {
    try {
      const pubkySdk = this.getPubkySdk();
      const httpBridge = pubkySdk.client;
      // Resolve pubky identifiers to transport URLs before fetching
      const resolvedUrl = url.startsWith('pubky') ? resolvePubky(url) : url;
      const response = await httpBridge.fetch(resolvedUrl, {
        method: options?.method,
        body: options?.body as BodyInit | undefined,
        credentials: 'include',
      });

      Libs.Logger.debug('Response from homeserver', { response });

      return response;
    } catch (error) {
      this.throwMappedError(error, {
        operation: 'request',
        message: 'Failed to fetch data',
        defaultType: Libs.HomeserverErrorType.FETCH_FAILED,
        defaultStatusCode: 500,
        url,
        method: options?.method,
      });
    }
  }

  /**
   * Performs a request against the homeserver.
   *
   * Sends a JSON payload when provided and throws if the response is not OK.
   * Note: Under the hood this uses `fetch` with `credentials: 'include'`.
   *
   * @param {HomeserverAction} method - HTTP method to use (e.g. PUT, POST, DELETE).
   * @param {string} url - Pubky URL.
   * @param {Record<string, unknown>} [bodyJson] - JSON body to serialize and send.
   */
  static async request<T>(method: Core.HomeserverAction, url: string, bodyJson?: Record<string, unknown>): Promise<T> {
    const session = this.getSession();

    if (session) {
      const sessionPath = this.toCurrentSessionStoragePath(url, session);
      if (sessionPath) {
        if (method === Core.HomeserverAction.GET) {
          const response = await (async () => {
            try {
              return await session.storage.get(sessionPath);
            } catch (error) {
              return this.throwMappedError(error, {
                operation: 'request',
                message: 'Failed to fetch data',
                defaultType: Libs.HomeserverErrorType.FETCH_FAILED,
                defaultStatusCode: 500,
                url,
                method,
              });
            }
          })();
          if (!response.ok) {
            await this.checkSessionExpiration(response, url);
            throw Libs.createHomeserverError(
              Libs.HomeserverErrorType.FETCH_FAILED,
              'Failed to fetch data',
              response.status,
              {
                url,
                statusCode: response.status,
                statusText: response.statusText,
              },
            );
          }

          try {
            const text = await response.text();
            if (!text) return undefined as T;
            return JSON.parse(text) as T;
          } catch {
            return undefined as T;
          }
        }

        if (method === Core.HomeserverAction.PUT) {
          try {
            await session.storage.putJson(sessionPath, bodyJson ?? {});
            return undefined as T;
          } catch (error) {
            this.throwMappedError(error, {
              operation: 'request',
              message: 'Failed to fetch data',
              defaultType: Libs.HomeserverErrorType.FETCH_FAILED,
              defaultStatusCode: 500,
              url,
              method,
            });
          }
        }

        if (method === Core.HomeserverAction.DELETE) {
          try {
            await session.storage.delete(sessionPath);
            return undefined as T;
          } catch (error) {
            this.throwMappedError(error, {
              operation: 'request',
              message: 'Failed to fetch data',
              defaultType: Libs.HomeserverErrorType.FETCH_FAILED,
              defaultStatusCode: 500,
              url,
              method,
            });
          }
        }
      }
    }

    const pubkySdk = this.getPubkySdk();
    const response = await (async () => {
      try {
        if (method === Core.HomeserverAction.GET) {
          return this.isHttpUrl(url) ? await pubkySdk.client.fetch(url) : await pubkySdk.publicStorage.get(url as Address);
        }
        return await this.fetch(url, { method, body: bodyJson ? JSON.stringify(bodyJson) : undefined });
      } catch (error) {
        return this.throwMappedError(error, {
          operation: 'request',
          message: 'Failed to fetch data',
          defaultType: Libs.HomeserverErrorType.FETCH_FAILED,
          defaultStatusCode: 500,
          url,
          method,
        });
      }
    })();

    if (!response.ok) {
      await this.checkSessionExpiration(response, url);
      throw Libs.createHomeserverError(Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to fetch data', response.status, {
        url,
        statusCode: response.status,
        statusText: response.statusText,
      });
    }

    if (method !== Core.HomeserverAction.GET) return undefined as T;

    try {
      const text = await response.text();
      if (!text) return undefined as T;
      return JSON.parse(text) as T;
    } catch {
      return undefined as T;
    }
  }

  /**
   * Uploads binary data to the homeserver using PUT.
   *
   * Intended for blob contents (e.g., avatars). Throws if the response is not OK.
   * Note: Uses `fetch` with `credentials: 'include'`.
   *
   * @param {string} url - Pubky URL.
   * @param {Uint8Array} blob - Raw bytes of the blob to upload.
   */
  static async putBlob(url: string, blob: Uint8Array) {
    const session = this.getSession();
    if (session) {
      const sessionPath = this.toCurrentSessionStoragePath(url, session);
      if (sessionPath) {
        try {
          await session.storage.putBytes(sessionPath, blob);
          return;
        } catch (error) {
          this.throwMappedError(error, {
            operation: 'putBlob',
            message: 'Failed to PUT blob data',
            defaultType: Libs.HomeserverErrorType.PUT_FAILED,
            defaultStatusCode: 500,
            url,
            method: Core.HomeserverAction.PUT,
          });
        }
      }
    }

    const response = await this.fetch(url, { method: Core.HomeserverAction.PUT, body: blob });
    if (!response.ok) {
      await this.checkSessionExpiration(response, url);
      throw Libs.createHomeserverError(Libs.HomeserverErrorType.PUT_FAILED, 'Failed to PUT blob data', response.status, {
        url,
      });
    }
  }

  /**
   * Lists files in a directory from the homeserver.
   *
   * Supports pagination with cursor and optional filtering.
   *
   * @param {string} baseDirectory - Base directory path to list files from.
   * @param {string} [cursor] - Optional cursor for pagination.
   * @param {boolean} [reverse=false] - Whether to list in reverse order.
   * @param {number} [limit=500] - Maximum number of files to return.
   * @returns {Promise<string[]>} Array of file URLs.
   */
  static async list(
    baseDirectory: string,
    cursor?: string,
    reverse: boolean = false,
    limit: number = 500,
  ): Promise<string[]> {
    const pubkySdk = this.getPubkySdk();
    try {
      const files = await pubkySdk.publicStorage.list(baseDirectory as Address, cursor ?? null, reverse, limit, false);
      Libs.Logger.debug('List successful', { baseDirectory, filesCount: files.length });
      return files;
    } catch (error) {
      this.throwMappedError(error, {
        operation: 'list',
        message: 'Failed to list files',
        defaultType: Libs.HomeserverErrorType.FETCH_FAILED,
        defaultStatusCode: 500,
        url: baseDirectory,
        details: { baseDirectory },
      });
    }
  }

  /**
   * Deletes a file from the homeserver.
   *
   * @param {string} url - Pubky URL of the file to delete.
   */
  static async delete(url: string) {
    await this.request(Core.HomeserverAction.DELETE, url);
    Libs.Logger.debug('Delete successful', { url });
  }

  /**
   * Fetches a resource from the homeserver.
   *
   * @param {string} url - Pubky URL to fetch.
   * @param {Core.FetchOptions} [options] - Optional fetch options.
   * @returns {Promise<Response>} The fetch response.
   */
  static async get(url: string, _options?: Core.FetchOptions): Promise<Response> {
    const pubkySdk = this.getPubkySdk();
    try {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return await pubkySdk.client.fetch(url);
      }
      return await pubkySdk.publicStorage.get(url as Address);
    } catch (error) {
      this.throwMappedError(error, {
        operation: 'get',
        message: 'Failed to fetch data',
        defaultType: Libs.HomeserverErrorType.FETCH_FAILED,
        defaultStatusCode: 500,
        url,
        method: Core.HomeserverAction.GET,
      });
    }
  }

  /**
   * Restore an authenticated Session from a previous `session.export()` snapshot.
   */
  static async restoreSession(sessionExport: string): Promise<Session> {
    try {
      const pubkySdk = this.getPubkySdk();
      return await pubkySdk.restoreSession(sessionExport);
    } catch (error) {
      this.throwMappedError(error, {
        operation: 'restoreSession',
        message: 'Failed to restore session',
        defaultType: Libs.HomeserverErrorType.NOT_AUTHENTICATED,
        defaultStatusCode: 401,
        details: { sessionExport: Boolean(sessionExport) },
      });
    }
  }

  // TODO: remove this once we have a proper signup token endpoint, mb should live inside of a test utils file
  static async generateSignupToken() {
    const endpoint = Libs.Env.NEXT_PUBLIC_HOMESERVER_ADMIN_URL;
    const password = Libs.Env.NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-Admin-Password': password,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw Libs.createCommonError(
        Libs.CommonErrorType.NETWORK_ERROR,
        `Failed to generate signup token: ${response.status} ${errorText}`,
        response.status,
      );
    }

    const token = (await response.text()).trim();
    if (!token) {
      throw Libs.createCommonError(Libs.CommonErrorType.UNEXPECTED_ERROR, 'No token received from server', 500);
    }

    return token;
  }
}
