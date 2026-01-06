import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Config from '@/config';
import {
  Pubky,
  PublicKey,
  Keypair,
  Capabilities,
  Signer,
  Address,
  resolvePubky,
  AuthFlowKind,
  Session,
} from '@synonymdev/pubky';
import {
  isHttpUrl,
  parseResponseOrUndefined,
  createCancelableAuthApproval,
  resolveOwnedSessionPath,
  assertOk,
  handleError,
  getOwnedResponse,
  PUBKY_PREFIX,
} from './homeserver.utils';

import type { PubPath } from './homeserver.types';

const TESTNET = Config.TESTNET.toString() === 'true';
const CAPABILITIES = '/pub/pubky.app/:rw';
const PUB_PATH_PREFIX = '/pub/' as const;

export class HomeserverService {
  private constructor() {}

  private static pubkySdk: Pubky | null = null;

  /**
   * Gets the Pubky SDK singleton.
   */
  private static getPubkySdk(): Pubky {
    if (!this.pubkySdk) {
      this.pubkySdk = TESTNET ? Pubky.testnet() : new Pubky();
    }
    return this.pubkySdk;
  }

  private static resolveOwnedSessionPath(url: string): { session: Session; path: PubPath<string> } | null {
    const session = Core.useAuthStore.getState().selectSession();
    return resolveOwnedSessionPath(url, session, PUB_PATH_PREFIX);
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
      return handleError(
        error,
        Libs.HomeserverErrorType.NOT_AUTHENTICATED,
        'Failed to get homeserver. Try again.',
        401,
        {
          publicKey: publicKey?.z32?.(),
        },
      );
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
      return handleError(
        error,
        Libs.HomeserverErrorType.SIGNUP_FAILED,
        'Signup failed',
        500,
        { signupTokenProvided: Boolean(signupToken) },
        true,
      );
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
    } catch (signinError) {
      try {
        // Republish keypair's homeserver
        const homeserverPublicKey = PublicKey.from(Config.HOMESERVER);
        await signer.pkdns.publishHomeserverForce(homeserverPublicKey);
        Libs.Logger.debug('Republish homeserver successful', { keypair: Libs.Identity.pubkyFromKeypair(keypair) });
        // Return undefined to signal caller should retry signin after republish
        return undefined;
      } catch (republishError) {
        // Report the republish error since that's what actually failed
        return handleError(
          republishError,
          Libs.HomeserverErrorType.NOT_AUTHENTICATED,
          'Not authenticated. Please sign up first.',
          401,
          { pubky: Libs.Identity.pubkyFromKeypair(keypair), originalSigninError: String(signinError) },
        );
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
      const approval = createCancelableAuthApproval(flow);

      return {
        authorizationUrl: flow.authorizationUrl,
        awaitApproval: approval.awaitApproval,
        cancelAuthFlow: approval.cancel,
      };
    } catch (error) {
      return handleError(error, Libs.HomeserverErrorType.AUTH_REQUEST_FAILED, 'Failed to generate auth URL', 500, {
        capabilities,
        relay: Config.DEFAULT_HTTP_RELAY,
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
      handleError(error, Libs.HomeserverErrorType.LOGOUT_FAILED, 'Failed to logout', 500, { url: 'signout' });
    }
  }

  private static async fetch(url: string, options?: Core.FetchOptions): Promise<Response> {
    try {
      const pubkySdk = this.getPubkySdk();
      const httpBridge = pubkySdk.client;
      // Resolve pubky identifiers to transport URLs before fetching
      const resolvedUrl = url.startsWith(PUBKY_PREFIX) ? resolvePubky(url) : url;
      const response = await httpBridge.fetch(resolvedUrl, {
        method: options?.method,
        body: options?.body as BodyInit | undefined,
        credentials: 'include',
      });

      Libs.Logger.debug('Response from homeserver', { response });

      return response;
    } catch (error) {
      return handleError(error, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to fetch data', 500, {
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
    const owned = this.resolveOwnedSessionPath(url);

    // Handle owned session paths
    if (owned) {
      const { session, path } = owned;

      switch (method) {
        case Core.HomeserverAction.GET: {
          const response = await getOwnedResponse(session, path, url);
          return (await parseResponseOrUndefined<T>(response)) as T;
        }
        case Core.HomeserverAction.PUT:
          await session.storage
            .putJson(path, bodyJson ?? {})
            .catch((error) =>
              handleError(error, Libs.HomeserverErrorType.PUT_FAILED, 'Failed to PUT data', 500, { url, method }),
            );
          return undefined as T;
        case Core.HomeserverAction.DELETE:
          await session.storage
            .delete(path)
            .catch((error) =>
              handleError(error, Libs.HomeserverErrorType.DELETE_FAILED, 'Failed to delete data', 500, { url, method }),
            );
          return undefined as T;
      }
    }

    // Non-owned: only GET allowed on non-HTTP URLs
    if (method !== Core.HomeserverAction.GET && !isHttpUrl(url)) {
      throw Libs.createCommonError(
        Libs.CommonErrorType.INVALID_INPUT,
        `Authenticated writes must target an owned ${PUB_PATH_PREFIX}* path for the current session.`,
        400,
        { url, method },
      );
    }

    // Handle public requests
    const pubkySdk = this.getPubkySdk();
    const fetchPromise =
      method === Core.HomeserverAction.GET
        ? isHttpUrl(url)
          ? pubkySdk.client.fetch(url)
          : pubkySdk.publicStorage.get(url as Address)
        : this.fetch(url, { method, body: bodyJson ? JSON.stringify(bodyJson) : undefined });

    const response = await fetchPromise.catch((error) =>
      handleError(error, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to fetch data', 500, { url, method }),
    );

    await assertOk(response, url, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to fetch data');

    return method === Core.HomeserverAction.GET
      ? ((await parseResponseOrUndefined<T>(response)) as T)
      : (undefined as T);
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
    const owned = this.resolveOwnedSessionPath(url);
    if (owned) {
      try {
        await owned.session.storage.putBytes(owned.path, blob);
        return;
      } catch (error) {
        handleError(error, Libs.HomeserverErrorType.PUT_FAILED, 'Failed to PUT blob data', 500, {
          url,
          method: Core.HomeserverAction.PUT,
        });
      }
    }

    if (!isHttpUrl(url)) {
      throw Libs.createCommonError(
        Libs.CommonErrorType.INVALID_INPUT,
        `Blob uploads must target an owned ${PUB_PATH_PREFIX}* path for the current session.`,
        400,
        { url },
      );
    }

    const response = await this.fetch(url, { method: Core.HomeserverAction.PUT, body: blob });
    await assertOk(response, url, Libs.HomeserverErrorType.PUT_FAILED, 'Failed to PUT blob data');
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
      const owned = this.resolveOwnedSessionPath(baseDirectory);
      if (owned) {
        const dirPath = owned.path.endsWith('/') ? owned.path : (`${owned.path}/` as PubPath<string>);
        const files = await owned.session.storage.list(dirPath, cursor ?? null, reverse, limit, false);
        Libs.Logger.debug('List successful', { baseDirectory, filesCount: files.length });
        return files;
      }

      const files = await pubkySdk.publicStorage.list(baseDirectory as Address, cursor ?? null, reverse, limit, false);
      Libs.Logger.debug('List successful', { baseDirectory, filesCount: files.length });
      return files;
    } catch (error) {
      return handleError(error, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to list files', 500, {
        url: baseDirectory,
        baseDirectory,
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
      if (isHttpUrl(url)) {
        return await pubkySdk.client.fetch(url);
      }

      const owned = this.resolveOwnedSessionPath(url);
      if (owned) {
        return await getOwnedResponse(owned.session, owned.path, url);
      }

      return await pubkySdk.publicStorage.get(url as Address);
    } catch (error) {
      return handleError(error, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to fetch data', 500, {
        url,
        method: Core.HomeserverAction.GET,
      });
    }
  }

  /**
   * Restore an authenticated Session from a previous `session.export()` snapshot.
   */
  static async restoreSession({ sessionExport }: Core.THomeserverRestoreSessionParams): Promise<Session> {
    try {
      const pubkySdk = this.getPubkySdk();
      return await pubkySdk.restoreSession(sessionExport);
    } catch (error) {
      return handleError(error, Libs.HomeserverErrorType.NOT_AUTHENTICATED, 'Failed to restore session', 401, {
        sessionExport: Boolean(sessionExport),
      });
    }
  }

  // TODO: remove this once we have a proper signup token endpoint, mb should live inside of a test utils file
  static async generateSignupToken() {
    if (process.env.NODE_ENV === 'production') {
      throw Libs.createCommonError(
        Libs.CommonErrorType.INVALID_INPUT,
        'generateSignupToken is only available in non-production environments.',
        400,
      );
    }

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
