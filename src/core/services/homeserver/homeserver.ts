import { Client, PublicKey } from '@synonymdev/pubky';
import init from 'pubky-app-specs';
import { type FetchOptions, type SignupResult, type TKeyPair } from '@/core';
import {
  AppError,
  HomeserverErrorType,
  createCommonError,
  CommonErrorType,
  createHomeserverError,
  Env,
  Logger,
  Identity,
} from '@/libs';
import { useOnboardingStore, useProfileStore } from '@/core/stores';

export class HomeserverService {
  private defaultKeypair = {
    publicKey: '',
    secretKey: '',
  };
  private static instance: HomeserverService;
  private client: Client;
  private currentKeypair: TKeyPair = this.defaultKeypair;
  private testnet = Env.NEXT_PUBLIC_TESTNET.toString() === 'true';
  private pkarrRelays = Env.NEXT_PUBLIC_PKARR_RELAYS.split(',');

  private constructor() {
    init();

    this.client = this.testnet
      ? Client.testnet()
      : new Client({
          pkarr: { relays: this.pkarrRelays, requestTimeout: null },
          userMaxRecordAge: null,
        });

    // Initialize session from store
    this.initializeFromStore();
  }

  public static getInstance(): HomeserverService {
    if (!HomeserverService.instance) {
      HomeserverService.instance = new HomeserverService();
    }
    return HomeserverService.instance;
  }

  private initializeFromStore(): void {
    try {
      const { secretKey } = useOnboardingStore.getState();
      const { session } = useProfileStore.getState();

      // If we have a session and valid keys, restore the keypair
      if (session && secretKey && secretKey.length === 64) {
        this.currentKeypair = Identity.keypairFromSecretKey(secretKey);
        Logger.debug('HomeserverService: Initialized from store', {
          hasSession: !!session,
          hasKeypair: !!this.currentKeypair,
        });
      }
    } catch (error) {
      Logger.error('HomeserverService: Failed to initialize from store', error);
      // Clear potentially corrupted session
      useProfileStore.getState().reset();
    }
  }

  async signup(keypair: TKeyPair, signupToken: string): Promise<SignupResult> {
    try {
      const homeserverPublicKey = PublicKey.from(Env.NEXT_PUBLIC_HOMESERVER);
      Logger.debug('Signing up', {
        keypair,
        signupToken,
        homeserverPublicKey: homeserverPublicKey,
        homeserverPublicKeyZ32: homeserverPublicKey.z32(),
      });
      const pubkyKeypair = Identity.pubkyKeypairFromSecretKey(keypair.secretKey);
      const session = await this.client.signup(pubkyKeypair, homeserverPublicKey, signupToken);
      this.currentKeypair = keypair;

      Logger.debug('Signup successful', { session });

      return { session };
    } catch (error) {
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
      // Ensure we're authenticated, automatically using keypair from store if needed
      await this.ensureAuthenticated();

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

  async logout(): Promise<void> {
    try {
      if (!this.isAuthenticated()) {
        throw createHomeserverError(
          HomeserverErrorType.NOT_AUTHENTICATED,
          'Not authenticated. No active session to logout.',
          401,
        );
      }

      const pubKey = PublicKey.from(this.currentKeypair?.publicKey);
      await this.client.signout(pubKey);

      this.currentKeypair = this.defaultKeypair;

      Logger.debug('Logout successful');
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error) {
        throw createHomeserverError(HomeserverErrorType.LOGOUT_FAILED, 'Failed to logout', 500, {
          originalError: error.message,
        });
      }

      throw createCommonError(CommonErrorType.NETWORK_ERROR, 'An unexpected error occurred during logout', 500, {
        error,
      });
    }
  }

  async ensureAuthenticated(secretKey?: string): Promise<void> {
    // If already authenticated, nothing to do
    if (this.isAuthenticated()) {
      return;
    }

    // Try to get keypair from the store if no secret key provided
    let keyToUse = secretKey;
    if (!keyToUse) {
      const { secretKey } = useOnboardingStore.getState();
      if (secretKey && secretKey.length === 64) {
        keyToUse = secretKey;
        Logger.debug('Using keypair from store for authentication');
      }
    }

    // If we have a secret key, try to restore the keypair and check if session exists
    if (keyToUse) {
      this.currentKeypair = Identity.keypairFromSecretKey(keyToUse);

      // Check if we have a valid session in the store
      const { session } = useProfileStore.getState();
      if (!session) {
        Logger.warn('Keypair exists but no session - user might need to sign up');
        this.currentKeypair = this.defaultKeypair;
      }
    }

    // If still not authenticated, throw error
    if (!this.isAuthenticated()) {
      throw createHomeserverError(
        HomeserverErrorType.NOT_AUTHENTICATED,
        'Not authenticated. Please sign up first.',
        401,
      );
    }
  }

  isAuthenticated(): boolean {
    const profileStore = useProfileStore.getState();
    return profileStore.isAuthenticated && !!this.currentKeypair;
  }
}
