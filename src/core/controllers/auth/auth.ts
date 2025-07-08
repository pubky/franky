import { Keypair } from '@synonymdev/pubky';
import { type SignupResult, HomeserverService } from '@/core';
import { Env, CommonErrorType, createCommonError } from '@/libs';

export class AuthController {
  private constructor() {} // Prevent instantiation

  static async signUp(keypair: Keypair, signupToken: string): Promise<SignupResult> {
    // todo: PR candidate to how to get rid of this homeserver service instance and call it directly as a static method
    const homeserverService = HomeserverService.getInstance();
    return await homeserverService.signup(keypair, signupToken);
  }

  static async logout(): Promise<void> {
    const homeserverService = HomeserverService.getInstance();
    await homeserverService.logout();
  }

  // TODO: remove this once we have a proper signup token endpoint
  static async generateSignupToken(): Promise<string> {
    const endpoint = Env.NEXT_PUBLIC_HOMESERVER_ADMIN_URL;
    const password = Env.NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD;

    if (!endpoint || !password) {
      throw createCommonError(
        CommonErrorType.INVALID_INPUT,
        'Missing required environment variables: NEXT_PUBLIC_HOMESERVER_ADMIN_URL or NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD',
        400,
      );
    }

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
