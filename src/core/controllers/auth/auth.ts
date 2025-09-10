import * as Core from '@/core';
import * as Libs from '@/libs';

export class AuthController {
  private constructor() {} // Prevent instantiation

  private static saveAuthenticatedData(authenticatedData: { pubky: string; session: Core.SignupResult['session'] }) {
    const profileStore = Core.useProfileStore.getState();
    profileStore.setSession(authenticatedData.session);
    profileStore.setCurrentUserPubky(authenticatedData.pubky);
    profileStore.setAuthenticated(true);
  }

  private static getHomeserverService() {
    const onboardingStore = Core.useOnboardingStore.getState();
    return Core.HomeserverService.getInstance(onboardingStore.secretKey);
  }

  static async signUp(keypair: Core.TKeyPair, signupToken: string) {
    // TODO: PR candidate to how to get rid of this homeserver service instance and call it directly as a static method
    const homeserverService = this.getHomeserverService();
    const data = await homeserverService.signup(keypair, signupToken);
    if (data) this.saveAuthenticatedData(data);
  }

  static async logout(): Promise<void> {
    const homeserverService = this.getHomeserverService();
    await homeserverService.logout();
    Core.useProfileStore.getState().reset();
    Core.useOnboardingStore.getState().reset();
    Libs.clearCookies();
  }

  static async loginWithMnemonic(mnemonic: string) {
    const homeserverService = this.getHomeserverService();
    const keypair = Libs.Identity.pubkyKeypairFromMnemonic(mnemonic);
    const data = await homeserverService.authenticateKeypair(keypair);
    if (data) this.saveAuthenticatedData(data);
  }

  static async loginWithEncryptedFile(encryptedFile: File, password: string) {
    const homeserverService = this.getHomeserverService();
    const keypair = await Libs.Identity.decryptRecoveryFile(encryptedFile, password);
    const data = await homeserverService.authenticateKeypair(keypair);
    if (data) this.saveAuthenticatedData(data);
  }

  // TODO: remove this once we have a proper signup token endpoint, mb should live inside of a test utils file
  static async generateSignupToken(): Promise<string> {
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
