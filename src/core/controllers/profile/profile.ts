import * as Core from '@/core';
import { z } from 'zod';

// Operations related with the profile.json file in the homeserver
export class ProfileController {
  private constructor() {} // Prevent instantiation

  static async read({ userId }: Core.TReadProfileParams) {
    return await Core.ProfileApplication.read({ userId });
  }

  // Upload avatar to homeserver and return the url
  static async uploadAvatar(avatarFile: File, pubky: Core.Pubky): Promise<string> {
    const fileContent = await avatarFile.arrayBuffer();
    const blobData = new Uint8Array(fileContent);

    // 1. Normalize Blob
    const blobResult = Core.FileNormalizer.toBlob(blobData, pubky);
    // 2. Normalize File Record
    const fileResult = Core.FileNormalizer.toFile(avatarFile, blobResult.meta.url, pubky);
    // 3. Upload to homeserver
    await Core.ProfileApplication.uploadAvatar({ blobResult, fileResult });

    return fileResult.meta.url;
  }

  static async create(profile: z.infer<typeof Core.UiUserSchema>, image: string | null, pubky: Core.Pubky) {
    const { user, meta } = Core.UserNormalizer.to(
      {
        name: profile.name,
        bio: profile.bio ?? '',
        image: image ?? '',
        links: (profile.links ?? []).map((link) => ({ title: link.label, url: link.url })),
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
}
