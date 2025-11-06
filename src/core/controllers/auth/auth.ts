import * as Core from '@/core';
import * as Libs from '@/libs';

export class AuthController {
  private constructor() {} // Prevent instantiation

  /**
   * Gets a homeserver service instance using the secret key from the onboarding store.
   * @returns Configured homeserver service instance
   */
  private static async signIn({ keypair }: Core.TKeypairParams) {
    const { secretKey } = Core.useOnboardingStore.getState();
    return await Core.AuthApplication.signIn({ keypair, secretKey });
  }

  /**
   * Saves authenticated user data to the auth store and initializes the application bootstrap.
   * Sets the session, current user pubky, notification state, and marks the user as authenticated.
   * @param params - Object containing session and pubky data from authentication
   */
  private static async saveAuthenticatedDataAndBootstrap({ session, pubky }: Core.TAuthenticatedData) {
    const authStore = Core.useAuthStore.getState();
    authStore.setSession(session);
    authStore.setCurrentUserPubky(pubky);
    const {
      meta: { url },
    } = Core.NotificationNormalizer.to(pubky);
    const notificationState = await Core.BootstrapApplication.initialize({ pubky, lastReadUrl: url });
    Core.useNotificationStore.getState().setState(notificationState);
    authStore.setAuthenticated(true);
  }

  /**
   * Authorizes the current user and initializes the application bootstrap with retry logic.
   * Uses the current user's pubky from the auth store to set up notifications and mark as authenticated.
   */
  static async authorizeAndBootstrap() {
    const authStore = Core.useAuthStore.getState();
    const pubky = authStore.selectCurrentUserPubky();
    const {
      meta: { url },
    } = Core.NotificationNormalizer.to(pubky);
    const notificationState = await Core.BootstrapApplication.initializeWithRetry({ pubky, lastReadUrl: url });
    Core.useNotificationStore.getState().setState(notificationState);
    authStore.setAuthenticated(true);
  }

  /**
   * Signs up a new user with the homeserver using the provided keypair and signup token.
   * Updates the auth store with session data, pubky, and marks the user as authenticated.
   * @param params - Object containing keypair and signup token for registration
   */
  static async signUp({ keypair, signupToken }: Core.TSignUpParams) {
    const { secretKey } = Core.useOnboardingStore.getState();
    const lastRead = Core.LastReadNormalizer.to(keypair.pubky);
    const { session, pubky } = await Core.AuthApplication.signUp({ keypair, signupToken, secretKey, lastRead });
    const authStore = Core.useAuthStore.getState();
    authStore.setSession(session);
    authStore.setCurrentUserPubky(pubky);
    authStore.setAuthenticated(true);
  }

  /**
   * Logs in a user using their mnemonic phrase to derive a keypair.
   * Authenticates the keypair with the homeserver and saves the authenticated data if successful.
   * @param params - Object containing the mnemonic phrase for key derivation
   */
  static async loginWithMnemonic({ mnemonic }: Core.TLoginWithMnemonicParams) {
    const keypair = Libs.Identity.pubkyKeypairFromMnemonic(mnemonic);
    const data = await this.signIn({ keypair });
    if (data) await this.saveAuthenticatedDataAndBootstrap(data);
  }

  /**
   * Logs in a user using an encrypted recovery file and password.
   * Decrypts the file to obtain the keypair, authenticates with the homeserver, and saves authenticated data if successful.
   * @param params - Object containing the encrypted file and password for decryption
   */
  static async loginWithEncryptedFile({ encryptedFile, password }: Core.TLoginWithEncryptedFileParams) {
    const keypair = await Libs.Identity.decryptRecoveryFile(encryptedFile, password);
    const data = await this.signIn({ keypair });
    if (data) await this.saveAuthenticatedDataAndBootstrap(data);
  }

  /**
   * Generates an authentication URL for external authentication flows.
   * @returns Promise resolving to the generated authentication URL
   */
  static async getAuthUrl() {
    const { secretKey } = Core.useOnboardingStore.getState();
    return await Core.AuthApplication.generateAuthUrl({ secretKey });
  }

  /**
   * Logs in a user using a public key from an authentication URL.
   * Resets onboarding state, sets the current user pubky, initializes bootstrap, and marks user as authenticated.
   * @param params - Object containing the public key for authentication
   * @throws Error if public key is not provided
   */
  static async loginWithAuthUrl({ publicKey }: Core.TLoginWithAuthUrlParams) {
    const authStore = Core.useAuthStore.getState();
    const onboardingStore = Core.useOnboardingStore.getState();
    onboardingStore.reset();
    const pubky = publicKey.z32();
    authStore.setCurrentUserPubky(pubky);
    const {
      meta: { url },
    } = Core.NotificationNormalizer.to(pubky);
    const notificationState = await Core.BootstrapApplication.initialize({ pubky, lastReadUrl: url });
    Core.useNotificationStore.getState().setState(notificationState);
    authStore.setAuthenticated(true);
  }

  /**
   * Logs out the current user from both the homeserver and local application state.
   * Clears all stored data including onboarding state, auth state, cookies, and database.
   * Always clears local state even if homeserver logout fails.
   */
  static async logout() {
    const authStore = Core.useAuthStore.getState();
    const onboardingStore = Core.useOnboardingStore.getState();
    const { secretKey } = onboardingStore;
    const pubky = authStore.selectCurrentUserPubky();
    await Core.AuthApplication.logout({ pubky, secretKey });
    // Always clear local state, even if homeserver logout fails
    onboardingStore.reset();
    authStore.reset();
    Libs.clearCookies();
    await Core.clearDatabase();
  }

  /**
   * Generates a signup token for user registration.
   * @returns Promise resolving to the generated signup token
   */
  static async generateSignupToken() {
    return await Core.HomeserverService.generateSignupToken();
  }
}
