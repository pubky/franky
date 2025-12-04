import * as Core from '@/core';
import { z } from 'zod';

// Operations related with the profile.json file in the homeserver
export class ProfileController {
  private constructor() {} // Prevent instantiation

  static async read({ userId }: Core.TReadProfileParams) {
    return await Core.ProfileApplication.read({ userId });
  }

  static async create(profile: z.infer<typeof Core.UiUserSchema>, image: string | null, pubky: Core.Pubky) {
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

    await Core.ProfileApplication.create({ profile: user, url: meta.url, pubky });
  }

  static async deleteAccount({ pubky, setProgress }: Core.TDeleteAccountInput) {
    await Core.ProfileApplication.deleteAccount({ pubky, setProgress });
  }

  static async downloadData({ pubky, setProgress }: Core.TDownloadDataInput) {
    await Core.ProfileApplication.downloadData({ pubky, setProgress });
  }

  static async updateStatus({ pubky, status }: { pubky: Core.Pubky; status: string }) {
    return await Core.ProfileApplication.updateStatus({ pubky, status });
  }

  static async updateProfile(profile: z.infer<typeof Core.UiUserSchema>, image: string | null, pubky: Core.Pubky) {
    await Core.ProfileApplication.updateProfile({
      pubky,
      name: profile.name,
      bio: profile.bio ?? '',
      image,
      links: Core.UserNormalizer.linksFromUi(profile.links),
    });
  }
}
