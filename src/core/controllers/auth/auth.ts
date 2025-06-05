import { HomeserverService, SignupResult, User, UserSchema, UserDetails, DEFAULT_NEW_USER } from '@/core';
import { env, CommonErrorType, createCommonError, Logger } from '@/libs';
import { Keypair } from '@synonymdev/pubky';

export class AuthController {
  private constructor() {} // Prevent instantiation

  static async signUp(userDetails: UserDetails): Promise<SignupResult> {
    const homeserverService = HomeserverService.getInstance();

    // Generate keypair
    const keypair = homeserverService.generateRandomKeypair();
    if (!keypair) {
      throw createCommonError(CommonErrorType.INVALID_INPUT, 'Failed to generate keypair', 400);
    }

    // Generate signup token
    const signupToken = await this.generateSignupToken();

    if (!signupToken) {
      throw createCommonError(CommonErrorType.INVALID_INPUT, 'Failed to generate signup token', 400);
    }

    // Save user to database
    const publicKey = keypair.publicKey().z32();
    const now = Date.now();
    const userData: UserSchema = {
      id: publicKey,
      details: {
        id: publicKey,
        name: userDetails.name,
        bio: userDetails.bio || '',
        links: null,
        status: null,
        image: userDetails.image || null,
        indexed_at: now,
      },
      ...DEFAULT_NEW_USER,
    };

    try {
      await User.insert(userData);
    } catch {
      throw createCommonError(CommonErrorType.INVALID_INPUT, 'Failed to save user to database', 400);
    }

    try {
      // Sign up
      const result = await homeserverService.signup(keypair, signupToken);
      return result;
    } catch {
      throw createCommonError(CommonErrorType.INVALID_INPUT, 'Failed to complete signup process', 400);
    }
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

  // Private method used internally by signUp
  private static async generateSignupToken(): Promise<string> {
    const endpoint = env.NEXT_PUBLIC_HOMESERVER_ADMIN_URL;
    const password = env.NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD;

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
