import { Client, Keypair, PublicKey } from '@synonymdev/pubky';
import init, { PostResult, PubkyAppPostKind, PubkySpecsBuilder } from 'pubky-app-specs';
import { type KeyPair, type FetchOptions, type SignupResult, type PostModelSchema } from '@/core';
import {
  AppError,
  HomeserverErrorType,
  createCommonError,
  CommonErrorType,
  createHomeserverError,
  Env,
  Logger,
} from '@/libs';

export class HomeserverService {
  private static instance: HomeserverService;
  private client: Client;
  private currentKeypair: Keypair | null = null;
  private currentSession: SignupResult['session'] | null = null;
  private testnet = Env.NEXT_PUBLIC_TESTNET.toString() === 'true';
  private pkarrRelays = Env.NEXT_PUBLIC_PKARR_RELAYS.split(',');
  private homeserverPublicKey = PublicKey.from(Env.NEXT_PUBLIC_HOMESERVER);

  // Flag to skip profile creation during tests
  private skipProfileCreation = process.env.VITEST === 'true';

  private constructor() {
    if (!this.skipProfileCreation) {
      init();
    }
    this.client = this.testnet
      ? Client.testnet()
      : new Client({
          pkarr: { relays: this.pkarrRelays, requestTimeout: null },
          userMaxRecordAge: null,
        });
  }

  public static getInstance(): HomeserverService {
    if (!HomeserverService.instance) {
      HomeserverService.instance = new HomeserverService();
    }
    return HomeserverService.instance;
  }

  async createPost(post: PostModelSchema): Promise<PostResult> {
    try {
      if (!this.currentKeypair) {
        throw createHomeserverError(
          HomeserverErrorType.NOT_AUTHENTICATED,
          'Not authenticated. Please signup first.',
          401,
        );
      }

      Logger.debug('Creating post on homeserver', { post });

      const builder = new PubkySpecsBuilder(this.currentKeypair.publicKey().z32());
      const kind = post.details.kind === 'short' ? PubkyAppPostKind.Short : PubkyAppPostKind.Long;
      const result = builder.createPost(post.details.content, kind, null, null, post.details.attachments);

      const response = await this.fetch(result.meta.url, {
        method: 'PUT',
        body: JSON.stringify(result.post.toJson()),
      });

      if (!response.ok) {
        throw createHomeserverError(HomeserverErrorType.CREATE_POST_FAILED, 'Failed to create post', 500, {
          originalError: response.statusText,
        });
      }
      Logger.debug('Post created on homeserver', { post });
      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw createHomeserverError(HomeserverErrorType.CREATE_POST_FAILED, 'Failed to create post', 500, {
        originalError: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async signup(keypair: Keypair, signupToken: string): Promise<SignupResult> {
    try {
      Logger.debug('Signing up', {
        keypair,
        signupToken,
        homeserverPublicKey: this.homeserverPublicKey,
        homeserverPublicKeyZ32: this.homeserverPublicKey.z32(),
      });
      const session = await this.client.signup(keypair, this.homeserverPublicKey, signupToken);
      this.currentKeypair = keypair;
      this.currentSession = session;

      Logger.debug('Signup successful', { session });

      return { session };
    } catch (error) {
      Logger.error('Signup failed', {
        error,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorString: String(error),
        isError: error instanceof Error,
        hasMessage: error != null && typeof error === 'object' && 'message' in error,
      });

      if (error instanceof AppError) {
        throw error;
      }

      // Simply pass through the error with original message preserved
      const errorMessage = error instanceof Error ? error.message : String(error);

      throw createHomeserverError(HomeserverErrorType.SIGNUP_FAILED, 'Signup failed', 500, {
        originalError: errorMessage,
      });
    }
  }

  async fetch(url: string, options?: FetchOptions): Promise<Response> {
    try {
      if (!this.isAuthenticated()) {
        throw createHomeserverError(
          HomeserverErrorType.NOT_AUTHENTICATED,
          'Not authenticated. Please signup first.',
          401,
        );
      }

      const response = await this.client.fetch(url, { ...options, credentials: 'include' });

      Logger.debug('Response from homeserver', { response });

      return response;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error) {
        throw createHomeserverError(HomeserverErrorType.FETCH_FAILED, 'Failed to fetch data', 500, {
          originalError: error.message,
          url,
        });
      }

      throw createCommonError(CommonErrorType.NETWORK_ERROR, 'An unexpected error occurred during fetch', 500, {
        error,
        url,
      });
    }
  }

  async logout(publicKey: string): Promise<void> {
    try {
      if (!this.isAuthenticated()) {
        throw createHomeserverError(
          HomeserverErrorType.NOT_AUTHENTICATED,
          'Not authenticated. No active session to logout.',
          401,
        );
      }

      const pubKey = PublicKey.from(publicKey);
      await this.client.signout(pubKey);

      this.currentKeypair = null;
      this.currentSession = null;

      Logger.debug('Logged out from homeserver');
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.message.includes('invalid public key')) {
          throw createHomeserverError(HomeserverErrorType.INVALID_PUBLIC_KEY, 'Invalid public key for logout', 400, {
            publicKey,
          });
        }
        throw createHomeserverError(HomeserverErrorType.LOGOUT_FAILED, 'Failed to logout', 500, {
          originalError: error.message,
        });
      }

      throw createCommonError(CommonErrorType.NETWORK_ERROR, 'An unexpected error occurred during logout', 500, {
        error,
      });
    }
  }

  generateRandomKeypair(): Keypair {
    try {
      const keypair = Keypair.random();
      this.currentKeypair = keypair;
      Logger.debug('Generated random keypair', { keypair });
      return keypair;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw createCommonError(CommonErrorType.NETWORK_ERROR, 'Failed to generate random keypair', 500, { error });
    }
  }

  generateRandomKeys(): KeyPair {
    try {
      const keypair = this.generateRandomKeypair();

      return {
        publicKey: keypair.publicKey().z32(),
        secretKey: keypair.secretKey(),
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw createCommonError(CommonErrorType.NETWORK_ERROR, 'Failed to generate random keys', 500, { error });
    }
  }

  keypairFromSecretKey(secretKey: Uint8Array): Keypair {
    try {
      if (secretKey.length !== 32) {
        throw new Error('Invalid secret key length');
      }
      const keypair = Keypair.fromSecretKey(secretKey);
      this.currentKeypair = keypair;

      Logger.debug('Keypair from secret key', { keypair });

      return keypair;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw createHomeserverError(HomeserverErrorType.INVALID_SECRET_KEY, 'Invalid secret key format', 400, { error });
    }
  }

  getClient(): Client {
    const client = this.client;
    Logger.debug('Getting client', { client });
    return client;
  }

  getCurrentKeypair(): Keypair | null {
    const keypair = this.currentKeypair;
    Logger.debug('Getting current keypair', { keypair });
    return keypair;
  }

  getCurrentSession(): SignupResult['session'] | null {
    const session = this.currentSession;
    Logger.debug('Getting current session', { session });
    return session;
  }

  isAuthenticated(): boolean {
    const isAuthenticated = this.currentSession !== null;
    Logger.debug('Checking if authenticated', { isAuthenticated });
    return isAuthenticated;
  }

  getCurrentPublicKey(): string | null {
    const publicKey = this.currentKeypair?.publicKey().z32();
    Logger.debug('Getting current public key', { publicKey });
    return publicKey ?? null;
  }
}
