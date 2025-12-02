import * as Core from '@/core';
import * as Libs from '@/libs';

export class AuthController {
  private constructor() {} // Prevent instantiation

  /**
   * Gets a homeserver service instance using the secret key from the onboarding store.
   * @param params - The authentication parameters
   * @param params.keypair - The cryptographic keypair for the user
   * @returns Configured homeserver service instance
   */
  private static async signIn({ keypair }: Core.TKeypairParams) {
    const { secretKey } = Core.useOnboardingStore.getState();
    return await Core.AuthApplication.signIn({ keypair, secretKey });
  }

  /**
   * Applies the bootstrap response to the auth store and notification store.
   * @param params - Object containing the auth store and bootstrap response
   * @param params.authStore - The auth store
   * @param params.bootstrapResponse - The bootstrap response
   */
  private static async applyBootstrapResponse({ authStore, bootstrapResponse }: Core.TBootstrapResponseParams) {
    const { notification, filesUris } = bootstrapResponse;
    await Core.FileApplication.persistFiles(filesUris);
    Core.useNotificationStore.getState().setState(notification);
    authStore.setAuthenticated(true);
  }

  /**
   * Saves authenticated user data to the auth store and initializes the application bootstrap.
   * @param params - Object containing session and pubky data from authentication
   * @param params.session - The user session data
   * @param params.pubky - The user's public key identifier
   */
  private static async saveAuthenticatedDataAndBootstrap({ session, pubky }: Core.TAuthenticatedData) {
    const authStore = Core.useAuthStore.getState();
    authStore.setSession(session);
    authStore.setCurrentUserPubky(pubky);
    const {
      meta: { url },
    } = Core.NotificationNormalizer.to(pubky);
    const bootstrapResponse = await Core.BootstrapApplication.initialize({ pubky, lastReadUrl: url });
    this.applyBootstrapResponse({ authStore, bootstrapResponse });
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
    const bootstrapResponse = await Core.BootstrapApplication.initializeWithRetry({ pubky, lastReadUrl: url });
    this.applyBootstrapResponse({ authStore, bootstrapResponse });
  }

  /**
   * Signs up a new user with the homeserver using the provided keypair and signup token.
   * @param params - Object containing keypair and signup token for registration
   * @param params.keypair - The cryptographic keypair for the user
   * @param params.signupToken - Invitation code for user registration
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
   * Authenticates the keypair with the homeserver and saves the authenticated data if successful.
   * @param params - Object containing the mnemonic phrase for key derivation
   * @param params.mnemonic - The mnemonic phrase for key derivation
   * @returns Promise resolving to true if authentication succeeded, false otherwise
   */
  static async loginWithMnemonic({ mnemonic }: Core.TLoginWithMnemonicParams): Promise<boolean> {
    const keypair = Libs.Identity.pubkyKeypairFromMnemonic(mnemonic);
    const data = await this.signIn({ keypair });
    if (data) {
      await this.saveAuthenticatedDataAndBootstrap(data);
      return true;
    }
    return false;
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
    const keypair = await Libs.Identity.decryptRecoveryFile(encryptedFile, password);
    const data = await this.signIn({ keypair });
    if (data) {
      await this.saveAuthenticatedDataAndBootstrap(data);
      return true;
    }
    return false;
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
   * @param params - Object containing the public key for authentication
   * @param params.publicKey - The public key for authentication
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
    const bootstrapResponse = await Core.BootstrapApplication.initialize({ pubky, lastReadUrl: url });
    this.applyBootstrapResponse({ authStore, bootstrapResponse });
  }

  /**
   * Logs out the current user from both the homeserver and local application state.
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
    return await Core.AuthApplication.generateSignupToken();
  }
}
