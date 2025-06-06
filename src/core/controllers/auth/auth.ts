import {
  type UserControllerNewData,
  type UserModelSchema,
  HomeserverService,
  SignupResult,
  UserController,
  DEFAULT_NEW_USER,
  DEFAULT_USER_DETAILS,
} from '@/core';
import { Env, CommonErrorType, createCommonError, Logger } from '@/libs';
import { Keypair } from '@synonymdev/pubky';

export class AuthController {
  private constructor() {} // Prevent instantiation

  static async signUp(
    newUser: UserControllerNewData,
    // signupToken?: string TODO: remove this once we have a proper signup token endpoint
  ): Promise<SignupResult> {
    const homeserverService = HomeserverService.getInstance();

    // Generate keypair
    const keypair = homeserverService.generateRandomKeypair();

    // Generate signup token
    // TODO: remove this once we have a proper signup token endpoint
    const signupToken = await this.generateSignupToken();

    // Save user to database
    const id = keypair.publicKey().z32();
    const userData: UserModelSchema = {
      id,
      details: {
        id,
        ...DEFAULT_USER_DETAILS,
        ...newUser,
      },
      ...DEFAULT_NEW_USER,
    };

    // save user to database
    const user = await UserController.insert(userData);

    // Sign up
    return await homeserverService.signup(user, keypair, signupToken);
  }

  static async getKeypair(): Promise<Keypair | null> {
    const homeserverService = HomeserverService.getInstance();
    return homeserverService.getCurrentKeypair();
  }

  static async logout(): Promise<void> {
    const homeserverService = HomeserverService.getInstance();
    const keypair = homeserverService.getCurrentKeypair();
    if (!keypair) {
      throw createCommonError(CommonErrorType.INVALID_INPUT, 'No keypair available', 400);
    }
    return homeserverService.logout(keypair.publicKey().z32());
  }

  // TODO: remove this once we have a proper signup token endpoint
  private static async generateSignupToken(): Promise<string> {
    const endpoint = Env.NEXT_PUBLIC_HOMESERVER_ADMIN_URL;
    const password = Env.NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD;

    if (!endpoint || !password) {
      throw new Error(
        'Missing required environment variables: NEXT_PUBLIC_HOMESERVER_ADMIN_URL or NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD',
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
      Logger.error('Failed to generate signup token:', { status: response.status, error: errorText });
      throw createCommonError(
        CommonErrorType.NETWORK_ERROR,
        `Failed to generate signup token: ${response.status} ${errorText}`,
        response.status,
      );
    }

    const token = (await response.text()).trim();
    if (!token) {
      Logger.error('No token in response');
      throw createCommonError(CommonErrorType.UNEXPECTED_ERROR, 'No token received from server', 500);
    }

    return token;
  }
}
