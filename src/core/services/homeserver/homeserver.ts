import { Client, Keypair, PublicKey } from '@synonymdev/pubky';
import init from 'pubky-app-specs';
import { type FetchOptions, type SignupResult } from '@/core';
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
  private static instance: HomeserverService;
  private client: Client;
  private currentKeypair: Keypair | null = null;
  private testnet = Env.NEXT_PUBLIC_TESTNET.toString() === 'true';
  private pkarrRelays = Env.NEXT_PUBLIC_PKARR_RELAYS.split(',');
  // todo: this variable should be inside the function or in the global state store file

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

    // Initialize session from store
    this.initializeFromStore();
  }

  public static getInstance(): HomeserverService {
    if (!HomeserverService.instance) {
      HomeserverService.instance = new HomeserverService();
    }
    return HomeserverService.instance;
  }

  // todo: move this into to global state store file
  private initializeFromStore(): void {
    try {
      const onboardingStore = useOnboardingStore.getState();
      const profileStore = useProfileStore.getState();

      // If we have a session and valid keys, restore the keypair
      if (profileStore.session && onboardingStore.secretKey && onboardingStore.secretKey.length === 32) {
        this.currentKeypair = Identity.keypairFromSecretKey(onboardingStore.secretKey);
        Logger.debug('HomeserverService: Initialized from store', {
          hasSession: !!profileStore.session,
          hasKeypair: !!this.currentKeypair,
        });
      }
    } catch (error) {
      Logger.error('HomeserverService: Failed to initialize from store', error);
      // Clear potentially corrupted session
      useProfileStore.getState().clearSession();
    }
  }

  async signup(keypair: Keypair, signupToken: string): Promise<SignupResult> {
    try {
      const homeserverPublicKey = PublicKey.from(Env.NEXT_PUBLIC_HOMESERVER);
      Logger.debug('Signing up', {
        keypair,
        signupToken,
        homeserverPublicKey: homeserverPublicKey,
        homeserverPublicKeyZ32: homeserverPublicKey.z32(),
      });
      const session = await this.client.signup(keypair, homeserverPublicKey, signupToken);
      this.currentKeypair = keypair;

      // todo: move this to auth controller in signUp method
      // Store session in Zustand store
      useProfileStore.getState().setSession(session);

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

      const pubKey = PublicKey.from(this.currentKeypair?.publicKey().z32() || '');
      await this.client.signout(pubKey);

      this.currentKeypair = null;

      // Clear local stores - import dynamically to avoid circular dependencies
      const { useProfileStore, useOnboardingStore } = await import('@/core/stores');

      useProfileStore.getState().clearSession();
      useOnboardingStore.getState().clearKeys();
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

  // todo: move this into to global state store file
  async ensureAuthenticated(secretKey?: Uint8Array): Promise<void> {
    // If already authenticated, nothing to do
    if (this.isAuthenticated()) {
      return;
    }

    // Try to get keypair from the store if no secret key provided
    let keyToUse = secretKey;
    if (!keyToUse) {
      const keypairStore = useOnboardingStore.getState();
      if (keypairStore.secretKey && keypairStore.secretKey.length === 32) {
        keyToUse = keypairStore.secretKey;
        Logger.debug('Using keypair from store for authentication');
      }
    }

    // If we have a secret key, try to restore the keypair and check if session exists
    if (keyToUse) {
      this.currentKeypair = Identity.keypairFromSecretKey(keyToUse);

      // Check if we have a valid session in the store
      const profileStore = useProfileStore.getState();
      if (!profileStore.session && this.currentKeypair) {
        Logger.warn('Keypair exists but no session - user might need to sign up');
        this.currentKeypair = null;
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

  // todo: move this into to global state store file
  getCurrentKeypair(): Keypair | null {
    const keypair = this.currentKeypair;
    Logger.debug('Getting current keypair', { keypair });
    return keypair;
  }

  // todo: move this into to global state store file
  getCurrentSession(): SignupResult['session'] | null {
    const profileStore = useProfileStore.getState();
    const session = profileStore.session;
    Logger.debug('Getting current session from store', { session });
    return session;
  }

  // todo: move this into to global state store file
  isAuthenticated(): boolean {
    const profileStore = useProfileStore.getState();
    const isAuthenticated = profileStore.isAuthenticated && !!this.currentKeypair;
    Logger.debug('Checking if authenticated', {
      isAuthenticated,
      hasSession: !!profileStore.session,
      hasKeypair: !!this.currentKeypair,
    });
    return isAuthenticated;
  }
}
