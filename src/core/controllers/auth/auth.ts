import * as Core from '@/core';
import * as Libs from '@/libs';

export class AuthController {
  private constructor() {} // Prevent instantiation

  private static async saveAuthenticatedDataAndBootstrap({ session, pubky }: Core.TAuthenticatedData) {
    const authStore = Core.useAuthStore.getState();
    authStore.setSession(session);
    authStore.setCurrentUserPubky(pubky);
    const notificationState = await Core.BootstrapApplication.hydrate(pubky);
    Core.useNotificationStore.getState().init(notificationState);
    authStore.setAuthenticated(true);
  }

  private static getHomeserverService() {
    const onboardingStore = Core.useOnboardingStore.getState();
    return Core.HomeserverService.getInstance(onboardingStore.secretKey);
  }

  static async signUp({ keypair, signupToken }: Core.TSignUpParams) {
    const homeserverService = this.getHomeserverService();
    const { session, pubky } = await homeserverService.signup(keypair, signupToken);
    const authStore = Core.useAuthStore.getState();
    authStore.setSession(session);
    authStore.setCurrentUserPubky(pubky);
    authStore.setAuthenticated(true);
  }

  static async authorizeAndBootstrap() {
    const authStore = Core.useAuthStore.getState();
    const pubky = authStore.currentUserPubky || '';
    const notificationState = await Core.BootstrapApplication.hydrateWithRetry(pubky);
    Core.useNotificationStore.getState().init(notificationState);
    authStore.setAuthenticated(true);
  }

  static async loginWithMnemonic({ mnemonic }: Core.TLoginWithMnemonicParams) {
    const homeserverService = this.getHomeserverService();
    const keypair = Libs.Identity.pubkyKeypairFromMnemonic(mnemonic);
    const data = await homeserverService.authenticateKeypair(keypair);
    if (data) await this.saveAuthenticatedDataAndBootstrap(data);
  }

  static async loginWithEncryptedFile({ encryptedFile, password }: Core.TLoginWithEncryptedFileParams) {
    const homeserverService = this.getHomeserverService();
    const keypair = await Libs.Identity.decryptRecoveryFile(encryptedFile, password);
    const data = await homeserverService.authenticateKeypair(keypair);
    if (data) await this.saveAuthenticatedDataAndBootstrap(data);
  }

  static async loginWithAuthUrl({ publicKey }: Core.TLoginWithAuthUrlParams) {
    if (!publicKey) {
      throw new Error('Public key is required');
    }
    const authStore = Core.useAuthStore.getState();
    const onboardingStore = Core.useOnboardingStore.getState();
    onboardingStore.reset();
    const pubky = publicKey.z32();
    authStore.setCurrentUserPubky(pubky);
    const notificationState = await Core.BootstrapApplication.hydrate(pubky);
    Core.useNotificationStore.getState().init(notificationState);
    authStore.setAuthenticated(true);
  }

  static async getAuthUrl() {
    const homeserverService = this.getHomeserverService();
    return await homeserverService.generateAuthUrl();
  }

  static async logout() {
    const authStore = Core.useAuthStore.getState();
    const onboardingStore = Core.useOnboardingStore.getState();
    const pubky = authStore.currentUserPubky || '';
    const homeserverService = this.getHomeserverService();
    await homeserverService.logout(pubky);
    // Always clear local state, even if homeserver logout fails
    onboardingStore.reset();
    authStore.reset();
    Libs.clearCookies();
    await Core.clearDatabase();
  }

  static async generateSignupToken() {
    return await Core.HomeserverService.generateSignupToken();
  }
}
