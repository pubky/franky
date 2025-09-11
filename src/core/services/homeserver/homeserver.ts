import { Client, Keypair, PublicKey } from '@synonymdev/pubky';

import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Config from '@/config';

export class HomeserverService {
  private defaultKeypair = {
    publicKey: '',
    secretKey: '',
  };
  private static instance: HomeserverService;
  private client: Client;
  private currentKeypair: Core.TKeyPair = this.defaultKeypair;
  private testnet = Config.TESTNET.toString() === 'true';
  private pkarrRelays = Config.PKARR_RELAYS.split(',');

  private constructor(secretKey: string) {
    this.client = this.testnet
      ? Client.testnet()
      : new Client({
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

  public static getInstance(secretKey: string): HomeserverService {
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

  private async checkHomeserver(pubky: string) {
    try {
      const pubkyPublicKey = PublicKey.from(pubky);
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

  private async checkSession(pubky: string) {
    try {
      const pubkyPublicKey = PublicKey.from(pubky);
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

  private async signin(keypair: Keypair) {
    try {
      await this.client.signin(keypair);
      Libs.Logger.debug('Signin successful', { keypair });
    } catch (error) {
      this.handleError(error, Libs.HomeserverErrorType.SIGNIN_FAILED, 'Failed to sign in. Try again.', 401, { error });
    }
  }

  async signup(keypair: Core.TKeyPair, signupToken: string) {
    try {
      const homeserverPublicKey = PublicKey.from(Config.HOMESERVER);
      Libs.Logger.debug('Signing up', {
        keypair,
        signupToken,
        homeserverPublicKey: homeserverPublicKey,
      });
      const pubkyKeypair = Libs.Identity.pubkyKeypairFromSecretKey(keypair.secretKey);
      const session = await this.client.signup(pubkyKeypair, homeserverPublicKey, signupToken);
      this.currentKeypair = keypair;

      Libs.Logger.debug('Signup successful', { session });

      return { pubky: keypair.publicKey, session };
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

  async logout(publicKey: string): Promise<void> {
    try {
      const pubKey = PublicKey.from(publicKey);
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

  async authenticateKeypair(keypair: Keypair) {
    try {
      const publicKey = keypair.publicKey().z32();
      const secretKey = Libs.Identity.secretKeyToHex(keypair.secretKey());

      // get homeserver from pkarr records
      await this.checkHomeserver(publicKey);

      // sign in with keypair
      await this.signin(keypair);

      // Retrieve the session
      const session = await this.checkSession(publicKey);

      // update current keypair
      this.currentKeypair = {
        publicKey,
        secretKey,
      };

      return { pubky: publicKey, session };
    } catch (error) {
      try {
        // try to republish homeserver
        await this.client.republishHomeserver(keypair, PublicKey.from(Config.HOMESERVER));
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
}
