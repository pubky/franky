import * as Core from '@/core';

export class AuthApplication {
  private constructor() {} // Prevent instantiation

  static async signUp({ keypair, signupToken, secretKey, lastRead }: Core.TAuthenticateKeypairParams): Promise<Core.TAuthenticateKeypairResult> {
    const homeserverService = Core.HomeserverService.getInstance(secretKey);
    const signUpResult = await homeserverService.signup(keypair, signupToken);
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, lastRead.meta.url, lastRead.last_read.toJson());
    return signUpResult;
  }

  static async signIn({ keypair, secretKey }: Core.THomeserverAuthenticateParams): Promise<Core.TAuthenticateKeypairResult | undefined> {
    const homeserverService = Core.HomeserverService.getInstance(secretKey);
    return await homeserverService.authenticateKeypair(keypair);
  }

  static async generateAuthUrl({ secretKey }: Core.TSecretKey) {
    const homeserverService = Core.HomeserverService.getInstance(secretKey);
    return await homeserverService.generateAuthUrl();
  }

  static async logout({ pubky, secretKey }: Core.TLogoutParams) {
    const homeserverService = Core.HomeserverService.getInstance(secretKey);
    await homeserverService.logout(pubky);
  }
}
