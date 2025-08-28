import * as Core from '@/core';
import { Env, CommonErrorType, createCommonError } from '@/libs';

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

    // clear all cookies
    document.cookie.split(';').forEach(function (c) {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    // redirect to login page
    window.location.href = '/logout';
  }

  // TODO: remove this once we have a proper signup token endpoint
  static async generateSignupToken(): Promise<string> {
    const endpoint = Env.NEXT_PUBLIC_HOMESERVER_ADMIN_URL;
    const password = Env.NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-Admin-Password': password,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw createCommonError(
        CommonErrorType.NETWORK_ERROR,
        `Failed to generate signup token: ${response.status} ${errorText}`,
        response.status,
      );
    }

    const token = (await response.text()).trim();
    if (!token) {
      throw createCommonError(CommonErrorType.UNEXPECTED_ERROR, 'No token received from server', 500);
    }

    return token;
  }
}
