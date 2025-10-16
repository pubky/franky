import * as Pubky from '@synonymdev/pubky';

import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Config from '@/config';

export class HomeserverService {
  private defaultKeypair = {
    pubky: '' as Core.Pubky,
    secretKey: '',
  };
  private static instance: HomeserverService;
  private client: Pubky.Client;
  private currentKeypair: Core.TKeyPair = this.defaultKeypair;
  private testnet = Config.TESTNET.toString() === 'true';
  private pkarrRelays = Config.PKARR_RELAYS.split(',');

  private constructor(secretKey: string = '') {
    this.client = this.testnet
      ? Pubky.Client.testnet()
      : new Pubky.Client({
          pkarr: { relays: this.pkarrRelays, requestTimeout: null },
          userMaxRecordAge: null,
        });

    // Initialize session from store
    try {
      this.currentKeypair = Libs.Identity.keypairFromSecretKey(secretKey);
    } catch {
      // If secretKey is invalid, use default empty keypair
      this.currentKeypair = this.defaultKeypair;
    }
  }

  public static getInstance(secretKey: string = ''): HomeserverService {
    try {
      if (!HomeserverService.instance) {
        HomeserverService.instance = new HomeserverService(secretKey);
      }
      return HomeserverService.instance;
    } catch (error) {
      throw Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, 'Invalid secret key format', 400, { error });
    }
  }

  private handleError(
    error: unknown,
    homeserverErrorType: Libs.HomeserverErrorType,
    message: string,
    statusCode: number,
    additionalContext: Record<string, unknown> = {},
    alwaysUseHomeserverError = false,
  ): never {
    // Re-throw AppErrors as they are already properly formatted
    if (error instanceof Libs.AppError) {
      throw error;
    }

    // Handle Error instances with original message preservation
    if (error instanceof Error) {
      throw Libs.createHomeserverError(homeserverErrorType, message, statusCode, {
        originalError: error.message,
        ...additionalContext,
      });
    }

    // For non-Error exceptions, use homeserver error if requested (signup case)
    if (alwaysUseHomeserverError) {
      throw Libs.createHomeserverError(homeserverErrorType, message, statusCode, {
        originalError: String(error),
        ...additionalContext,
      });
    }

    // Default: Handle non-Error exceptions with network error
    throw Libs.createCommonError(
      Libs.CommonErrorType.NETWORK_ERROR,
      `An unexpected error occurred during ${message.toLowerCase()}`,
      statusCode,
      {
        error,
        ...additionalContext,
      },
    );
  }

  private async checkHomeserver(pubky: Core.Pubky) {
    try {
      const pubkyPublicKey = Pubky.PublicKey.from(pubky);
      const homeserver = await this.client.getHomeserver(pubkyPublicKey);

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
        error,
      });
    }
  }

  private async checkSession(pubky: Core.Pubky) {
    try {
      const pubkyPublicKey = Pubky.PublicKey.from(pubky);
      const session = await this.client.session(pubkyPublicKey);
      if (!session) {
        throw Libs.createHomeserverError(
          Libs.HomeserverErrorType.NOT_AUTHENTICATED,
          'Failed to get session. Try again.',
          401,
        );
      }
      Libs.Logger.debug('Session successful', { session });
      return session;
    } catch (error) {
      this.handleError(error, Libs.HomeserverErrorType.NOT_AUTHENTICATED, 'Failed to get session. Try again.', 401, {
        error,
      });
    }
  }

  private async signin(keypair: Pubky.Keypair) {
    try {
      await this.client.signin(keypair);
      Libs.Logger.debug('Signin successful', { keypair });
    } catch (error) {
      this.handleError(error, Libs.HomeserverErrorType.SIGNIN_FAILED, 'Failed to sign in. Try again.', 401, { error });
    }
  }

  async signup(keypair: Core.TKeyPair, signupToken: string) {
    try {
      const homeserverPublicKey = Pubky.PublicKey.from(Config.HOMESERVER);
      Libs.Logger.debug('Signing up', {
        keypair,
        signupToken,
        homeserverPublicKey: homeserverPublicKey,
      });
      const pubkyKeypair = Libs.Identity.pubkyKeypairFromSecretKey(keypair.secretKey);
      const session = await this.client.signup(pubkyKeypair, homeserverPublicKey, signupToken);
      this.currentKeypair = keypair;

      Libs.Logger.debug('Signup successful', { session });

      return { pubky: keypair.pubky, session };
    } catch (error) {
      this.handleError(error, Libs.HomeserverErrorType.SIGNUP_FAILED, 'Signup failed', 500, {}, true);
    }
  }

  async fetch(url: string, options?: Core.FetchOptions): Promise<Response> {
    try {
      const response = await this.client.fetch(url, { ...options, credentials: 'include' });

      Libs.Logger.debug('Response from homeserver', { response });

      return response;
    } catch (error) {
      this.handleError(error, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to fetch data', 500, { url });
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
  static async request(method: Core.HomeserverAction, url: string, bodyJson?: Record<string, unknown>) {
    const homeserver = this.getInstance();
    const response = await homeserver.fetch(url, {
      method,
      body: bodyJson ? JSON.stringify(bodyJson) : undefined,
    });

    if (!response.ok) {
      throw Libs.createHomeserverError(Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to fetch data', 500, {
        url,
      });
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
    const homeserver = this.getInstance();
    const response = await homeserver.fetch(url, {
      method: Core.HomeserverAction.PUT,
      body: blob,
    });

    if (!response.ok) {
      throw Libs.createHomeserverError(Libs.HomeserverErrorType.PUT_FAILED, 'Failed to PUT blob data', 500, {
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
    const homeserver = this.getInstance();
    try {
      const files = await homeserver.client.list(baseDirectory, cursor, reverse, limit);
      Libs.Logger.debug('List successful', { baseDirectory, filesCount: files.length });
      return files;
    } catch (error) {
      return homeserver.handleError(error, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to list files', 500, {
        baseDirectory,
      });
    }
  }

  /**
   * Fetches a resource from the homeserver.
   *
   * @param {string} url - Pubky URL to fetch.
   * @param {Core.FetchOptions} [options] - Optional fetch options.
   * @returns {Promise<Response>} The fetch response.
   */
  static async get(url: string, options?: Core.FetchOptions): Promise<Response> {
    const homeserver = this.getInstance();
    return await homeserver.fetch(url, options);
  }

  async logout(pubky: Core.Pubky) {
    try {
      const pubKey = Pubky.PublicKey.from(pubky);
      await this.client.signout(pubKey);

      this.currentKeypair = this.defaultKeypair;

      Libs.Logger.debug('Logout successful');
    } catch (error) {
      this.handleError(error, Libs.HomeserverErrorType.LOGOUT_FAILED, 'Failed to logout', 500);
    }
  }

  async generateAuthUrl(caps?: string) {
    const capabilities = caps || '/pub/pubky.app/:rw';

    try {
      const authRequest = this.client.authRequest(Config.DEFAULT_HTTP_RELAY, capabilities);

      return {
        url: String(authRequest.url()),
        promise: authRequest.response(),
      };
    } catch (error) {
      this.handleError(error, Libs.HomeserverErrorType.AUTH_REQUEST_FAILED, 'Failed to generate auth URL', 500, {
        capabilities,
        relay: Config.DEFAULT_HTTP_RELAY,
      });
    }
  }

  async authenticateKeypair(keypair: Pubky.Keypair) {
    try {
      const pubky = keypair.publicKey().z32();
      const secretKey = Libs.Identity.secretKeyToHex(keypair.secretKey());

      // get homeserver from pkarr records
      await this.checkHomeserver(pubky);

      // sign in with keypair
      await this.signin(keypair);

      // Retrieve the session
      const session = await this.checkSession(pubky);

      // update current keypair
      this.currentKeypair = {
        pubky,
        secretKey,
      };

      return { pubky, session };
    } catch (error) {
      try {
        // try to republish homeserver
        await this.client.republishHomeserver(keypair, Pubky.PublicKey.from(Config.HOMESERVER));
        Libs.Logger.debug('Republish homeserver successful', { keypair });
      } catch {
        this.handleError(
          error,
          Libs.HomeserverErrorType.NOT_AUTHENTICATED,
          'Not authenticated. Please sign up first.',
          401,
          { error },
        );
      }
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
