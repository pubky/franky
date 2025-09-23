import * as Core from '@/core';
import * as Libs from '@/libs';

export class AuthController {
  private constructor() {} // Prevent instantiation

  private static async saveAuthenticatedDataAndBootstrap({ session, pubky }: Core.TAuthenticatedData) {
    try {
      const profileStore = Core.useProfileStore.getState();
      profileStore.setSession(session);
      profileStore.setCurrentUserPubky(pubky);
      // Once we have the session, we have to bootstrap the app
      await Core.NexusBootstrapService.retrieveAndPersist(pubky);
      // Setting that state, the guard enforces to redirect to the main page (/feed)
      profileStore.setAuthenticated(true);
    } catch (error) {
      throw error;
    }
  }

  private static getHomeserverService() {
    const onboardingStore = Core.useOnboardingStore.getState();
    return Core.HomeserverService.getInstance(onboardingStore.secretKey);
  }

  static async signUp({ keypair, signupToken }: Core.TSignUpParams) {
    const homeserverService = this.getHomeserverService();
    const { session, pubky } = await homeserverService.signup(keypair, signupToken);
    //if (data) await this.saveAuthenticatedDataAndBootstrap(data);
    const profileStore = Core.useProfileStore.getState();
    profileStore.setSession(session);
    profileStore.setCurrentUserPubky(pubky);
  }

  static async authorizeAndBootstrap() {
    try {
      const profileStore = Core.useProfileStore.getState();
      const pubky = profileStore.currentUserPubky || '';
      let success = false;
      let retries = 0;
      while (!success && retries < 3) {
        try {
          await Core.NexusBootstrapService.retrieveAndPersist(pubky);
          success = true;
          profileStore.setAuthenticated(true);
        } catch (error) {
          console.error('Failed to bootstrap', error, retries);
          // Wait 5 seconds before retrying. Let nexus to index the user
          await new Promise((resolve) => setTimeout(resolve, 5000));
          retries++;
        }
      }
      if (!success) {
        throw new Error('User still not indexed');
      }
    } catch (error) {
      throw error;
    }
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
    if (publicKey) {
      const profileStore = Core.useProfileStore.getState();
      const onboardingStore = Core.useOnboardingStore.getState();
      onboardingStore.reset();
      const pubky = publicKey.z32();
      profileStore.setCurrentUserPubky(pubky);
      // Once we have the session, we have to bootstrap the app
      await Core.NexusBootstrapService.retrieveAndPersist(pubky);
      // Setting that state, the guard enforces to redirect to the main page (/feed)
      profileStore.setAuthenticated(true);
    }
  }

  static async getAuthUrl() {
    const homeserverService = this.getHomeserverService();
    return await homeserverService.generateAuthUrl();
  }

  static async logout() {
    const profileStore = Core.useProfileStore.getState();
    const pubky = profileStore.currentUserPubky || '';

    try {
      const homeserverService = this.getHomeserverService();
      await homeserverService.logout(pubky);
    } finally {
      // Always clear local state, even if homeserver logout fails
      Core.useOnboardingStore.getState().reset();
      Core.useProfileStore.getState().reset();
      Libs.clearCookies();
    }
  }

  // TODO: remove this once we have a proper signup token endpoint, mb should live inside of a test utils file
  static async generateSignupToken() {
    const endpoint = Libs.Env.NEXT_PUBLIC_HOMESERVER_ADMIN_URL;
    const password = Libs.Env.NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-Admin-Password': password,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw Libs.createCommonError(
        Libs.CommonErrorType.NETWORK_ERROR,
        `Failed to generate signup token: ${response.status} ${errorText}`,
        response.status,
      );
    }

    const token = (await response.text()).trim();
    if (!token) {
      throw Libs.createCommonError(Libs.CommonErrorType.UNEXPECTED_ERROR, 'No token received from server', 500);
    }

    return token;
  }
}
