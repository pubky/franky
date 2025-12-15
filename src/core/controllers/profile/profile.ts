import * as Core from '@/core';
import * as Libs from '@/libs';

// Operations related with the profile.json file in the homeserver
export class ProfileController {
  private constructor() {} // Prevent instantiation

  static async commitCreate({ profile, image, pubky }: Core.TCommitSetDetailsParams) {
    const { user, meta } = Core.UserNormalizer.to(
      {
        name: profile.name,
        bio: profile.bio ?? '',
        image: image ?? '',
        links: Core.UserNormalizer.linksFromUi(profile.links),
        status: '', // default is blank
      },
      pubky,
    );

    await Core.ProfileApplication.commitSetDetails({ profile: user, url: meta.url, pubky });
  }

  static async commitUpdateStatus({ pubky, status }: { pubky: Core.Pubky; status: string }) {
    return await Core.ProfileApplication.commitUpdateDetailsStatus({ pubky, status });
  }

  static async commitUpdate({ name, bio, links, image, pubky }: Core.TCommitUpdateDetailsParams) {
    await Core.ProfileApplication.commitUpdateDetails({
      pubky,
      name,
      bio,
      image,
      links: Core.UserNormalizer.linksFromUi(links),
    });
  }

  /**
   * Generates a new pair of secret key and mnemonic and sets them in the onboarding and auth stores.
   */
  static generateSecrets() {
    const secrets = Libs.Identity.generateSecrets();
    Core.useOnboardingStore.getState().setSecrets(secrets);
    Core.useAuthStore.getState().setCurrentUserPubky(Libs.Identity.pubkyFromSecret(secrets.secretKey));
  }

  /**
   * Creates a recovery file for the keypair
   * @param passphrase - The passphrase to use to create the recovery file
   */
  static createRecoveryFile(passphrase: string) {
    const secretKey = Core.useOnboardingStore.getState().selectSecretKey();
    const keypair = Libs.Identity.keypairFromSecretKey(secretKey);
    Libs.Identity.createRecoveryFile({ keypair, passphrase });
  }

  static async deleteAccount({ pubky, setProgress }: Core.TDeleteAccountInput) {
    await Core.ProfileApplication.deleteAccount({ pubky, setProgress });
  }

  static async downloadData({ pubky, setProgress }: Core.TDownloadDataInput) {
    await Core.ProfileApplication.downloadData({ pubky, setProgress });
  }
}
