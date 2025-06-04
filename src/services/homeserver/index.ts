import { Client, Keypair, PublicKey } from '@synonymdev/pubky';
import type { FetchOptions, SignupResult, KeyPair } from './types';
import {
  AppError,
  createCommonError,
  CommonErrorType,
  HomeserverErrorType,
  createHomeserverError,
} from '../../lib/error';
import { env } from '@/lib/env';

class HomeserverService {
  private static instance: HomeserverService;
  private client: Client;
  private currentKeypair: Keypair | null = null;
  private currentSession: SignupResult['session'] | null = null;
  private testnet = env.NEXT_PUBLIC_TESTNET.toString() === 'true';
  private pkarrRelays = env.NEXT_PUBLIC_PKARR_RELAYS.split(',');
  private homeserverPublicKey = PublicKey.from(env.NEXT_PUBLIC_HOMESERVER);

  private constructor() {
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

  async signup(keypair: Keypair, signupToken?: string): Promise<SignupResult> {
    try {
      const session = await this.client.signup(keypair, this.homeserverPublicKey, signupToken);
      this.currentKeypair = keypair;
      this.currentSession = session;
      return { session };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error) {
        console.error('Error during signup:', error);
        if (error.message.includes('invalid public key')) {
          throw createHomeserverError(
            HomeserverErrorType.INVALID_HOMESERVER_KEY,
            'Invalid homeserver public key',
            400,
            {
              homeserverPublicKey: this.homeserverPublicKey,
            },
          );
        }
        throw createHomeserverError(HomeserverErrorType.SIGNUP_FAILED, 'Failed to signup', 500, {
          originalError: error.message,
        });
      }

      throw createCommonError(CommonErrorType.NETWORK_ERROR, 'An unexpected error occurred during signup', 500, {
        error,
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

      return await this.client.fetch(url, options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error) {
        console.error('Error during fetch:', error);
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
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error) {
        console.error('Error during logout:', error);
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
      return keypair;
    } catch (error) {
      throw createCommonError(CommonErrorType.NETWORK_ERROR, 'Failed to generate random keypair', 500, { error });
    }
  }

  generateRandomKeys(): KeyPair {
    try {
      const keypair = this.generateRandomKeypair();
      return {
        publicKey: keypair.publicKey().z32(),
        secretKey: keypair.secretKey().toString(),
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
      return keypair;
    } catch (error) {
      throw createHomeserverError(HomeserverErrorType.INVALID_SECRET_KEY, 'Invalid secret key format', 400, { error });
    }
  }

  getClient(): Client {
    return this.client;
  }

  getCurrentKeypair(): Keypair | null {
    return this.currentKeypair;
  }

  getCurrentSession(): SignupResult['session'] | null {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return this.currentSession !== null;
  }

  getCurrentPublicKey(): string | null {
    return this.currentKeypair?.publicKey().z32() ?? null;
  }
}

export const homeserverService = HomeserverService.getInstance();

export { HomeserverService };
