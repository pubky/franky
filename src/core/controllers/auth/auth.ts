import * as Core from '@/core';
import * as Libs from '@/libs';

export class AuthController {
  private constructor() {} // Prevent instantiation

  static async signUp(keypair: Core.TKeyPair, signupToken: string): Promise<Core.SignupResult> {
    // todo: PR candidate to how to get rid of this homeserver service instance and call it directly as a static method
    const homeserverService = Core.HomeserverService.getInstance();
    const session = await homeserverService.signup(keypair, signupToken);

    // store session in store
    Core.useProfileStore.getState().setSession(session.session);
    return session;
  }

  static async logout(): Promise<void> {
    const homeserverService = Core.HomeserverService.getInstance();
    await homeserverService.logout();

    // clear stores
    Core.useProfileStore.getState().reset();
    Core.useOnboardingStore.getState().reset();

    // TODO: extract this to a utils function
    // clear all cookies
    document.cookie.split(';').forEach(function (c) {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    // redirect to login page
    window.location.href = '/logout';
  }

  static async loginWithMnemonic(mnemonic: string) {
    const homeserverService = Core.HomeserverService.getInstance();

    const keypair = Libs.Identity.pubkyKeypairFromMnemonic(mnemonic);
    await homeserverService.authenticateKeypair(keypair);
  }

  // TODO: remove this once we have a proper signup token endpoint
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
