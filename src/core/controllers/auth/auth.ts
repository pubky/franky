import * as Core from '@/core';
import * as Libs from '@/libs';

export class AuthController {
  private constructor() {} // Prevent instantiation

  private static restoreSessionPromise: Promise<boolean> | null = null;
  private static activeCancelAuthFlow: (() => void) | null = null;
  private static authUrlRequestId = 0;
  private static lastRestoreAttemptExport: string | null = null;

  private static freeActiveAuthFlow() {
    const cancel = this.activeCancelAuthFlow;
    this.activeCancelAuthFlow = null;
    if (!cancel) return;
    cancel();
  }

  static async restoreSessionIfAvailable(): Promise<boolean> {
    const authStore = Core.useAuthStore.getState();

    if (!authStore.hasHydrated) return false;
    if (authStore.session) return true;
    if (!authStore.sessionExport) {
      if (authStore.isRestoringSession) authStore.setIsRestoringSession(false);
      return false;
    }

    if (this.restoreSessionPromise) {
      return await this.restoreSessionPromise;
    }

    this.restoreSessionPromise = (async () => {
      authStore.setIsRestoringSession(true);
      try {
        const { session } = await Core.AuthApplication.restoreSession(authStore.sessionExport!);
        await this.initializeAuthenticatedSession({ session });
        return true;
      } catch (error) {
        Libs.Logger.error('Failed to restore session from persisted export', error);
        Core.HomeserverService.setSession(null);
        authStore.setSession(null);
        authStore.setCurrentUserPubky(null);
        authStore.setHasProfile(false);
        return false;
      } finally {
        authStore.setIsRestoringSession(false);
        this.restoreSessionPromise = null;
      }
    })();

    return await this.restoreSessionPromise;
  }

  /**
   * Best-effort session restore on app start (e.g. RouteGuardProvider mount).
   * Dedupes repeated attempts for the same `sessionExport` to avoid loops.
   */
  static async maybeRestoreSessionOnHydration(params: {
    hasHydrated: boolean;
    session: unknown;
    sessionExport: string | null;
  }): Promise<void> {
    if (!params.hasHydrated) return;
    if (params.session) return;
    if (!params.sessionExport) return;
    if (this.lastRestoreAttemptExport === params.sessionExport) return;

    this.lastRestoreAttemptExport = params.sessionExport;
    await this.restoreSessionIfAvailable();
  }

  /**
   * Gets a homeserver service instance using the secret key from the onboarding store.
   * @param params - The authentication parameters
   * @param params.keypair - The cryptographic keypair for the user
   * @returns Configured homeserver service instance
   */
  private static async signIn({ keypair }: Core.TKeypairParams): Promise<boolean> {
    // Clear database before sign in to ensure clean state
    await Core.clearDatabase();
    const session = await Core.AuthApplication.signIn({ keypair });
    if (!session) {
      Libs.Logger.error('Failed to sign in. Please try again.', { keypair });
      return false;
    }
    await this.initializeAuthenticatedSession(session);
    return true;
  }

  /**
   * Bootstrap data to initialize the application snapshot.
   * @param params - Object containing session and pubky data from authentication
   * @param params.session - The user session data
   * @param params.pubky - The user's public key identifier
   */
  private static async hydrateMeImAlive({ pubky }: Core.TPubkyParams) {
    const {
      meta: { url },
    } = Core.NotificationNormalizer.to(pubky);
    const { notification } = await Core.BootstrapApplication.initialize({ pubky, lastReadUrl: url });
    Core.useNotificationStore.getState().setState(notification);
  }

  /**
   * Initializes the authenticated session and checks if the user is signed up (profile.json in homeserver).
   * @param params - Object containing session data from authentication
   * @param params.session - The user session data
   */
  static async initializeAuthenticatedSession({ session }: Core.THomeserverSessionResult) {
    this.freeActiveAuthFlow();
    Core.HomeserverService.setSession(session);
    const pubky = Libs.Identity.pubkyFromSession({ session });
    const authStore = Core.useAuthStore.getState();
    const isSignedUp = await Core.AuthApplication.userIsSignedUp({ pubky });
    if (isSignedUp) {
      // IMPORTANT: That one has to be executed before the initial state is set. If not, the routeProvider
      // it will redirect to '/home' page and after it would hit the bootstrap endpoint while user is waiting in the home page.
      await this.hydrateMeImAlive({ pubky });
    }
    authStore.setSession(session);
    authStore.setCurrentUserPubky(pubky);
    authStore.setHasProfile(isSignedUp);
  }

  /**
   * Signs up a new user with the homeserver using the provided secret key and signup token.
   * @param params - Object containing secret key and signup token for registration
   * @param params.secretKey - The secret key for the user
   * @param params.signupToken - Invitation code for user registration
   */
  static async signUp({ secretKey, signupToken }: Core.TSignUpParams) {
    // Clear database before sign up to ensure clean state
    await Core.clearDatabase();
    const keypair = Libs.Identity.keypairFromSecretKey(secretKey);
    const { session } = await Core.AuthApplication.signUp({ keypair, signupToken });
    const authStore = Core.useAuthStore.getState();
    Core.HomeserverService.setSession(session);
    authStore.setSession(session);
    authStore.setCurrentUserPubky(Libs.Identity.pubkyFromSession({ session }));
    authStore.setHasProfile(false);
  }

  /**
   * Authenticates the keypair with the homeserver and saves the authenticated data if successful.
   * @param params - Object containing the mnemonic phrase for key derivation
   * @param params.mnemonic - The mnemonic phrase for key derivation
   * @returns Promise resolving to true if authentication succeeded, false otherwise
   */
  static async loginWithMnemonic({ mnemonic }: Core.TLoginWithMnemonicParams): Promise<boolean> {
    const keypair = Libs.Identity.keypairFromMnemonic(mnemonic);
    return await this.signIn({ keypair });
  }

  /**
   * Decrypts the file to obtain the keypair, authenticates with the homeserver, and saves authenticated data if successful.
   * @param params - Object containing the encrypted file and password for decryption
   * @param params.encryptedFile - The encrypted recovery file
   * @param params.password - The password to decrypt the recovery file
   * @returns Promise resolving to true if authentication succeeded, false otherwise
   */
  static async loginWithEncryptedFile({
    encryptedFile,
    password,
  }: Core.TLoginWithEncryptedFileParams): Promise<boolean> {
    const keypair = await Libs.Identity.decryptRecoveryFile({ encryptedFile, passphrase: password });
    return await this.signIn({ keypair });
  }

  /**
   * Generates an authentication URL for external authentication flows.
   * @returns Promise resolving to the generated authentication URL
   */
  static async getAuthUrl(): Promise<Core.TGenerateAuthUrlResult> {
    await Core.clearDatabase();
    const requestId = ++this.authUrlRequestId;
    this.freeActiveAuthFlow();
    const { authorizationUrl, awaitApproval, cancelAuthFlow } = await Core.AuthApplication.generateAuthUrl();

    if (requestId !== this.authUrlRequestId) {
      // Stale request (e.g. React StrictMode overlap): cancel immediately so we don't keep polling forever.
      cancelAuthFlow();
      return {
        authorizationUrl,
        awaitApproval: awaitApproval.finally(() => cancelAuthFlow()),
        cancelAuthFlow,
      };
    }

    this.activeCancelAuthFlow = cancelAuthFlow;

    // Ensure the polling flow is always dropped once the promise resolves/rejects,
    // even if the caller forgets to free it.
    const wrappedAwaitApproval = awaitApproval.finally(() => {
      if (this.activeCancelAuthFlow === cancelAuthFlow) {
        this.activeCancelAuthFlow = null;
      }
      cancelAuthFlow();
    });

    return { authorizationUrl, awaitApproval: wrappedAwaitApproval, cancelAuthFlow };
  }

  /**
   * Logs out the current user from both the homeserver and local application state.
   */
  static async logout() {
    const authStore = Core.useAuthStore.getState();
    const onboardingStore = Core.useOnboardingStore.getState();

    if (authStore.session) {
      await Core.AuthApplication.logout({ session: authStore.session });
    }
    // Always clear local state, even if homeserver logout fails
    authStore.setSession(null);
    onboardingStore.reset();
    authStore.reset();
    Core.HomeserverService.setSession(null);
    this.freeActiveAuthFlow();
    Libs.clearCookies();
    await Core.clearDatabase();
  }

  /**
   * Initializes the application bootstrap after profile creation.
   * Waits for Nexus to index the user's profile.json, then bootstraps notifications and data.
   */
  static async bootstrapWithDelay() {
    const authStore = Core.useAuthStore.getState();
    const pubky = authStore.selectCurrentUserPubky();
    // Wait 5 seconds before bootstrap to let Nexus index the user
    Libs.Logger.info(`Waiting 5 seconds to index ${pubky} profile.json in Nexus before bootstrap...`);
    await Libs.sleep(5000);
    await this.hydrateMeImAlive({ pubky });
    authStore.setHasProfile(true);
  }

  /**
   * Generates a signup token for user registration. This is just for testing environments
   * @returns Promise resolving to the generated signup token
   */
  static async generateSignupToken() {
    return await Core.AuthApplication.generateSignupToken();
  }
}
