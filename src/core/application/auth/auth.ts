import * as Core from '@/core';
import * as Libs from '@/libs';

export class AuthApplication {
  private constructor() {} // Prevent instantiation

  /**
   * Signs up a new user in the homeserver with the provided keypair and authentication credentials.
   *
   * @param params - The authentication parameters containing user credentials
   * @param params.keypair - The cryptographic keypair for the user
   * @param params.signupToken - Invitation code for user registration
   * @param params.secretKey - Secret key for homeserver service
   * @returns Session and pubky of the signed up user
   */
  static async signUp({
    keypair,
    signupToken
  }: Core.THomeserverSignUpParams): Promise<Core.THomeserverSessionResult> {
    return await Core.HomeserverService.signUp({ keypair, signupToken });
  }

  /**
   * Authenticates the user against the homeserver using their cryptographic keypair.
   *
   * @param params - The authentication parameters
   * @param params.keypair - The cryptographic keypair for the user authentication
   * @param params.secretKey - Secret key for homeserver service
   * @returns Session and pubky of the authenticated user
   */
  static async signIn({
    keypair
  }: Core.TKeypairParams): Promise<Core.THomeserverSessionResult | undefined> {
    if (!keypair) {
      throw new Libs.AppError(Libs.CommonErrorType.INVALID_INPUT, 'Keypair not found in onboarding store. Please regenerate your keys and try again.', 400);
    }
    return await Core.HomeserverService.signIn({ keypair });
  }

  /**
   * Generates an authentication URL for Pubky Ring App
   *
   * @param params - Parameters containing the secret key
   * @param params.secretKey - Secret key for homeserver service
   * @returns Authentication URL and promise to the generated authentication URL
   */
  static async generateAuthUrl(): Promise<Core.TGenerateAuthUrlResult> {
    return await Core.HomeserverService.generateAuthUrl();
  }

  /**
   * Logs out a user from the system.
   *
   * @param params - The logout parameters
   * @param params.pubky - The user's public key identifier
   * @param params.secretKey - Secret key for homeserver service
   * @returns Void
   */
  static async logout(data: Core.TPubkyParams) {
    await Core.HomeserverService.logout(data);
    // Reset the PubkySpecsSingleton to ensure clean state for subsequent sign-ins
    Core.PubkySpecsSingleton.reset();
  }

  /**
   * Generates a signup token for user registration.
   * @returns Promise resolving to the generated signup token
   */
  static async generateSignupToken() {
    return await Core.HomeserverService.generateSignupToken();
  }
}
