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
  type AuthFlow,
} from '@synonymdev/pubky';

import * as Core from '@/core';
import { parseResponseOrThrow } from '@/core/services/nexus/nexus.utils';
import * as Libs from '@/libs';
import * as Config from '@/config';

const TESTNET = Config.TESTNET.toString() === 'true';
const CAPABILITIES = '/pub/pubky.app/:rw';
const AUTH_FLOW_CANCELED_ERROR_NAME = 'AuthFlowCanceled';

type RetryableStatusCode = 408 | 429 | 500 | 502 | 503 | 504;

const getStatusCode = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) return undefined;
  if (!('data' in error)) return undefined;
  const data = (error as { data?: unknown }).data;
  if (typeof data !== 'object' || data === null) return undefined;
  if (!('statusCode' in data)) return undefined;
  const statusCode = (data as { statusCode?: unknown }).statusCode;
  return typeof statusCode === 'number' ? statusCode : undefined;
};

const isRetryableRelayPollError = (error: unknown): boolean => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'RequestError'
  ) {
    const statusCode = getStatusCode(error);
    if (!statusCode) return true;
    return ([408, 429, 500, 502, 503, 504] as RetryableStatusCode[]).includes(statusCode as RetryableStatusCode);
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('timed out') || message.includes('timeout')) return true;
    if (message.includes('504') || message.includes('gateway')) return true;
  }

  return false;
};

const createCanceledError = (): Error => {
  const error = new Error('Auth flow canceled');
  error.name = AUTH_FLOW_CANCELED_ERROR_NAME;
  return error;
};

type CancelableAuthApproval = {
  awaitApproval: Promise<Session>;
  cancel: () => void;
};

// Pubky rc7: awaitApproval consumes the WASM handle, so we use tryPollOnce to keep flow.free() usable.
const createCancelableAuthApproval = (
  flow: AuthFlow,
  options?: { pollIntervalMs?: number },
): CancelableAuthApproval => {
  const pollIntervalMs = options?.pollIntervalMs ?? 2_000;

  let canceled = false;
  let freed = false;

  const cancel = () => {
    canceled = true;
    if (freed) return;
    freed = true;
    try {
      flow.free();
    } catch {
      // Ignore double-free or already-finalized WASM objects.
    }
  };

  const awaitApproval = (async () => {
    await Libs.sleep(0);

    for (;;) {
      if (canceled) throw createCanceledError();

      try {
        const maybeSession = await flow.tryPollOnce();
        if (maybeSession) return maybeSession;
      } catch (error) {
        if (canceled) throw createCanceledError();
        if (isRetryableRelayPollError(error)) {
          await Libs.sleep(pollIntervalMs);
          continue;
        }
        throw error;
      }

      await Libs.sleep(pollIntervalMs);
    }
  })();

  return {
    awaitApproval: awaitApproval.finally(() => cancel()),
    cancel,
  };
};

export class HomeserverService {
  private constructor() {}

  private static currentSession: Session | null = null;
  private static pubkySdk: Pubky | null = null;

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
  private static getPubkySdk(): Pubky {
    if (!this.pubkySdk) {
      this.pubkySdk = TESTNET ? Pubky.testnet() : new Pubky();
    }
    return this.pubkySdk;
  }

  private static getSession() {
    return this.currentSession;
  }

  private static isHttpUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  private static toPathname(url: string): string | null {
    if (url.startsWith('/')) return url;

    if (url.startsWith('pubky://')) {
      const rest = url.slice('pubky://'.length);
      const idx = rest.indexOf('/');
      return idx === -1 ? null : rest.slice(idx);
    }

    if (url.startsWith('pubky') && !url.startsWith('pubkyauth://')) {
      const idx = url.indexOf('/', 'pubky'.length);
      return idx === -1 ? null : url.slice(idx);
    }

    if (this.isHttpUrl(url)) {
      try {
        return new URL(url).pathname || null;
      } catch {
        return null;
      }
    }

    return null;
  }

  private static extractPubkyZ32(url: string): string | null {
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
        return hostname.startsWith('_pubky.') ? hostname.slice('_pubky.'.length) || null : null;
      } catch {
        return null;
      }
    }

    return null;
  }

  private static resolveOwnedSessionPath(url: string): { session: Session; path: `/pub/${string}` } | null {
    const session = this.getSession();
    if (!session) return null;

    const pathname = this.toPathname(url);
    if (!pathname || !pathname.startsWith('/pub/')) return null;
    const path = pathname as `/pub/${string}`;

    if (url.startsWith('/')) return { session, path };

    const sessionPubky = session.info.publicKey.z32();
    const urlPubky = this.extractPubkyZ32(url);
    if (!urlPubky || urlPubky !== sessionPubky) return null;

    return { session, path };
  }

  private static extractStatusCode(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null) return undefined;

    if ('statusCode' in error && typeof (error as { statusCode?: unknown }).statusCode === 'number') {
      return (error as { statusCode: number }).statusCode;
    }

    if (!('data' in error)) return undefined;
    const data = (error as { data?: unknown }).data;
    if (typeof data !== 'object' || data === null) return undefined;
    if (!('statusCode' in data)) return undefined;
    const statusCode = (data as { statusCode?: unknown }).statusCode;
    return typeof statusCode === 'number' ? statusCode : undefined;
  }

  private static isPubkyErrorLike(error: unknown): error is { name: string; message: string; data?: unknown } {
    if (typeof error !== 'object' || error === null) return false;
    return (
      'name' in error &&
      typeof (error as { name?: unknown }).name === 'string' &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    );
  }

  private static async parseResponseOrUndefined<T>(response: Response): Promise<T | undefined> {
    try {
      return await parseResponseOrThrow<T>(response);
    } catch (error) {
      if (error instanceof Libs.AppError && error.type === Libs.NexusErrorType.INVALID_RESPONSE) {
        return undefined;
      }
      throw error;
    }
  }

  private static async assertOk(
    response: Response,
    url: string,
    errorType: Libs.HomeserverErrorType,
    errorMessage: string,
  ): Promise<void> {
    if (response.ok) return;
    await this.checkSessionExpiration(response, url);
    throw Libs.createHomeserverError(errorType, errorMessage, response.status, {
      url,
      statusCode: response.status,
      statusText: response.statusText,
    });
  }

  private static async getOwnedResponse(session: Session, path: `/pub/${string}`, url: string): Promise<Response> {
    const response = await (async () => {
      try {
        return await session.storage.get(path);
      } catch (error) {
        return this.handleError(error, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to fetch data', 500, {
          url,
          method: Core.HomeserverAction.GET,
        });
      }
    })();

    await this.assertOk(response, url, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to fetch data');
    return response;
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
   * Handles errors from the homeserver
   * @param error - The error to handle
   * @param homeserverErrorType - The type of error
   * @param message - The message to use
   * @param statusCode - The status code to use
   * @param additionalContext - Additional context to add to the error
   * @param alwaysUseHomeserverError - Whether to always use the homeserver error
   * @returns Never
   */
  private static handleError(
    error: unknown,
    homeserverErrorType: Libs.HomeserverErrorType,
    message: string,
    statusCode: number,
    additionalContext: Record<string, unknown> = {},
    alwaysUseHomeserverError = false,
  ): never {
    if (error instanceof Libs.AppError) {
      throw error;
    }

    const resolvedStatusCode = this.extractStatusCode(error) ?? statusCode;

    if (this.isPubkyErrorLike(error)) {
      if (error.name === 'InvalidInput') {
        throw Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, error.message, 400, {
          originalError: error.message,
          ...additionalContext,
        });
      }

      if (error.name === 'AuthenticationError' || resolvedStatusCode === 401) {
        throw Libs.createHomeserverError(
          Libs.HomeserverErrorType.SESSION_EXPIRED,
          error.message || 'Session expired',
          401,
          {
            originalError: error.message,
            ...additionalContext,
          },
        );
      }

      throw Libs.createHomeserverError(homeserverErrorType, message, resolvedStatusCode, {
        originalError: error.message,
        ...additionalContext,
      });
    }

    if (error instanceof Error) {
      if (resolvedStatusCode === 401) {
        throw Libs.createHomeserverError(
          Libs.HomeserverErrorType.SESSION_EXPIRED,
          error.message || 'Session expired',
          401,
          {
            originalError: error.message,
            ...additionalContext,
          },
        );
      }

      throw Libs.createHomeserverError(homeserverErrorType, message, resolvedStatusCode, {
        originalError: error.message,
        ...additionalContext,
      });
    }

    if (alwaysUseHomeserverError) {
      throw Libs.createHomeserverError(homeserverErrorType, message, resolvedStatusCode, {
        originalError: String(error),
        ...additionalContext,
      });
    }

    throw Libs.createCommonError(
      Libs.CommonErrorType.NETWORK_ERROR,
      `An unexpected error occurred during ${message.toLowerCase()}`,
      resolvedStatusCode,
      {
        error,
        ...additionalContext,
      },
    );
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
      this.handleError(error, Libs.HomeserverErrorType.NOT_AUTHENTICATED, 'Failed to get homeserver. Try again.', 401, {
        publicKey: publicKey?.z32?.(),
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
      this.handleError(
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
    } catch (error) {
      try {
        // Republish keypair's homeserver
        const homeserverPublicKey = PublicKey.from(Config.HOMESERVER);
        await signer.pkdns.publishHomeserverForce(homeserverPublicKey);
        Libs.Logger.debug('Republish homeserver successful', { keypair: Libs.Identity.pubkyFromKeypair(keypair) });
        // Return undefined to signal caller should retry signin after republish
        return undefined;
      } catch {
        this.handleError(
          error,
          Libs.HomeserverErrorType.NOT_AUTHENTICATED,
          'Not authenticated. Please sign up first.',
          401,
          { pubky: Libs.Identity.pubkyFromKeypair(keypair) },
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
      this.handleError(error, Libs.HomeserverErrorType.AUTH_REQUEST_FAILED, 'Failed to generate auth URL', 500, {
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
      this.handleError(error, Libs.HomeserverErrorType.LOGOUT_FAILED, 'Failed to logout', 500, { url: 'signout' });
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
      this.handleError(error, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to fetch data', 500, {
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

    if (owned) {
      const { session, path } = owned;

      if (method === Core.HomeserverAction.GET) {
        const response = await this.getOwnedResponse(session, path, url);
        return (await this.parseResponseOrUndefined<T>(response)) as T;
      }

      if (method === Core.HomeserverAction.PUT) {
        try {
          await session.storage.putJson(path, bodyJson ?? {});
          return undefined as T;
        } catch (error) {
          this.handleError(error, Libs.HomeserverErrorType.PUT_FAILED, 'Failed to PUT data', 500, {
            url,
            method,
          });
        }
      }

      if (method === Core.HomeserverAction.DELETE) {
        try {
          await session.storage.delete(path);
          return undefined as T;
        } catch (error) {
          this.handleError(error, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to delete data', 500, {
            url,
            method,
          });
        }
      }
    }

    if (method !== Core.HomeserverAction.GET && !this.isHttpUrl(url)) {
      throw Libs.createCommonError(
        Libs.CommonErrorType.INVALID_INPUT,
        'Authenticated writes must target an owned /pub/* path for the current session.',
        400,
        { url, method },
      );
    }

    const pubkySdk = this.getPubkySdk();
    const response = await (async () => {
      try {
        if (method === Core.HomeserverAction.GET) {
          return this.isHttpUrl(url)
            ? await pubkySdk.client.fetch(url)
            : await pubkySdk.publicStorage.get(url as Address);
        }
        return await this.fetch(url, { method, body: bodyJson ? JSON.stringify(bodyJson) : undefined });
      } catch (error) {
        return this.handleError(error, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to fetch data', 500, {
          url,
          method,
        });
      }
    })();

    await this.assertOk(response, url, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to fetch data');

    if (method !== Core.HomeserverAction.GET) return undefined as T;

    return (await this.parseResponseOrUndefined<T>(response)) as T;
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
        this.handleError(error, Libs.HomeserverErrorType.PUT_FAILED, 'Failed to PUT blob data', 500, {
          url,
          method: Core.HomeserverAction.PUT,
        });
      }
    }

    if (!this.isHttpUrl(url)) {
      throw Libs.createCommonError(
        Libs.CommonErrorType.INVALID_INPUT,
        'Blob uploads must target an owned /pub/* path for the current session.',
        400,
        { url },
      );
    }

    const response = await this.fetch(url, { method: Core.HomeserverAction.PUT, body: blob });
    await this.assertOk(response, url, Libs.HomeserverErrorType.PUT_FAILED, 'Failed to PUT blob data');
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
        const dirPath = owned.path.endsWith('/') ? owned.path : (`${owned.path}/` as `/pub/${string}`);
        const files = await owned.session.storage.list(dirPath, cursor ?? null, reverse, limit, false);
        Libs.Logger.debug('List successful', { baseDirectory, filesCount: files.length });
        return files;
      }

      const files = await pubkySdk.publicStorage.list(baseDirectory as Address, cursor ?? null, reverse, limit, false);
      Libs.Logger.debug('List successful', { baseDirectory, filesCount: files.length });
      return files;
    } catch (error) {
      this.handleError(error, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to list files', 500, {
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
      if (this.isHttpUrl(url)) {
        return await pubkySdk.client.fetch(url);
      }

      const owned = this.resolveOwnedSessionPath(url);
      if (owned) {
        return await this.getOwnedResponse(owned.session, owned.path, url);
      }

      return await pubkySdk.publicStorage.get(url as Address);
    } catch (error) {
      this.handleError(error, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to fetch data', 500, {
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
      this.handleError(error, Libs.HomeserverErrorType.NOT_AUTHENTICATED, 'Failed to restore session', 401, {
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
