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
  private static async signIn({ keypair }: Core.TKeypairParams): Promise<boolean> {
    // Clear database before sign in to ensure clean state
    await Core.clearDatabase();
    const session = await Core.AuthApplication.signIn({ keypair });
    if (!session) {
      Libs.Logger.error('Failed to sign in. Please try again.', { keypair });
      return false;
    }
    await this.persistSessionAndBootstrap(session);
    return true;
  }

  /**
   * Persists the session related data and initializes the application bootstrap.
   * @param params - Object containing session and pubky data from authentication
   * @param params.session - The user session data
   * @param params.pubky - The user's public key identifier
   */
  static async persistSessionAndBootstrap({ session }: Core.THomeserverSessionResult) {
    const pubky = Libs.Identity.pubkyFromSession({ session });
    const authStore = Core.useAuthStore.getState();
    authStore.setSession(session);
    authStore.setCurrentUserPubky(pubky);
    const {
      meta: { url },
    } = Core.NotificationNormalizer.to(pubky);
    const { notification } = await Core.BootstrapApplication.initialize({ pubky, lastReadUrl: url });
    Core.useNotificationStore.getState().setState(notification);
    authStore.setAuthenticated(true);
  }

  /**
   * Signs up a new user with the homeserver using the provided keypair and signup token.
   * @param params - Object containing keypair and signup token for registration
   * @param params.keypair - The cryptographic keypair for the user
   * @param params.signupToken - Invitation code for user registration
   */
  static async signUp({ keypair, signupToken }: Core.THomeserverSignUpParams) {
    // Clear database before sign up to ensure clean state
    await Core.clearDatabase();
    const { session } = await Core.AuthApplication.signUp({ keypair, signupToken });
    const authStore = Core.useAuthStore.getState();
    authStore.setSession(session);
    authStore.setCurrentUserPubky(Libs.Identity.pubkyFromSession({ session }));
    authStore.setAuthenticated(true);
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
    return await this.signIn({ keypair })
  }

  /**
   * Generates an authentication URL for external authentication flows.
   * @returns Promise resolving to the generated authentication URL
   */
  static async getAuthUrl(): Promise<Core.TGenerateAuthUrlResult> {
    await Core.clearDatabase();
    return await Core.AuthApplication.generateAuthUrl();
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
    onboardingStore.reset();
    authStore.reset();
    Libs.clearCookies();
    await Core.clearDatabase();
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

    // Wait 5 seconds before bootstrap to let Nexus index the user
    Libs.Logger.info(`Waiting 5 seconds before bootstrap...`);
    await Libs.sleep(5000);

    const { notification } = await Core.BootstrapApplication.initialize({ pubky, lastReadUrl: url });
    Core.useNotificationStore.getState().setState(notification);
    authStore.setAuthenticated(true);
  }

  /**
   * Generates a signup token for user registration.
   * @returns Promise resolving to the generated signup token
   */
  static async generateSignupToken() {
    return await Core.AuthApplication.generateSignupToken();
  }
}
