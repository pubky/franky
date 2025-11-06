import * as Core from '@/core';

export class AuthApplication {
  private constructor() {} // Prevent instantiation

  /**
   * Signs up a new user in the homeserver with the provided keypair and authentication credentials.
   * Also PUTs the user's last_read file in the homeserver.
   *
   * @param params - The authentication parameters containing user credentials
   * @param params.keypair - The cryptographic keypair for the user
   * @param params.signupToken - Invitation code for user registration
   * @param params.secretKey - Secret key for homeserver service
   * @param params.lastRead - User's last read timestamp
   * @returns Session and pubky of the signed up user
   */
  static async signUp({
    keypair,
    signupToken,
    secretKey,
    lastRead,
  }: Core.TAuthenticateKeypairParams): Promise<Core.TAuthenticateKeypairResult> {
    const homeserverService = Core.HomeserverService.getInstance(secretKey);
    const signUpResult = await homeserverService.signup(keypair, signupToken);
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, lastRead.meta.url, lastRead.last_read.toJson());
    return signUpResult;
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
    keypair,
    secretKey,
  }: Core.THomeserverAuthenticateParams): Promise<Core.TAuthenticateKeypairResult | undefined> {
    const homeserverService = Core.HomeserverService.getInstance(secretKey);
    return await homeserverService.authenticateKeypair(keypair);
  }

  /**
   * Generates an authentication URL for Pubky Ring App
   *
   * @param params - Parameters containing the secret key
   * @param params.secretKey - Secret key for homeserver service
   * @returns Authentication URL and promise to the generated authentication URL
   */
  static async generateAuthUrl({ secretKey }: Core.TSecretKey) {
    const homeserverService = Core.HomeserverService.getInstance(secretKey);
    return await homeserverService.generateAuthUrl();
  }

  /**
   * Logs out a user from the system.
   *
   * @param params - The logout parameters
   * @param params.pubky - The user's public key identifier
   * @param params.secretKey - Secret key for homeserver service
   * @returns Void
   */
  static async logout({ pubky, secretKey }: Core.TLogoutParams) {
    const homeserverService = Core.HomeserverService.getInstance(secretKey);
    await homeserverService.logout(pubky);
  }
}
