import * as Core from '@/core';
import * as Libs from '@/libs';
import { PubkyAppUser } from 'pubky-app-specs';
import { z } from 'zod';

export class UserController {
  private constructor() {} // Prevent instantiation

  private static async getAuthenticatedHomeserverService() {
    const onboardingStore = Core.useOnboardingStore.getState();

    if (!onboardingStore.secretKey) {
      throw new Error('No secretKey found in onboarding store. User may need to re-authenticate.');
    }

    const homeserver = Core.HomeserverService.getInstance(onboardingStore.secretKey);
    const pubkyKeypair = Libs.Identity.pubkyKeypairFromSecretKey(onboardingStore.secretKey);
    await homeserver.authenticateKeypair(pubkyKeypair);

    return homeserver;
  }

  // Upload avatar to homeserver and return the url
  static async uploadAvatar(avatarFile: File, pubky: Core.Pubky): Promise<string> {
    const homeserver = await this.getAuthenticatedHomeserverService();

    // 1. Upload Blob
    const fileContent = await avatarFile.arrayBuffer();
    const blobData = new Uint8Array(fileContent);
    const blobResult = await Core.FileNormalizer.toBlob(blobData, pubky);

    // Push blob to homeserver
    await homeserver.fetch(blobResult.meta.url, {
      method: 'PUT',
      body: blobResult.blob.data,
    });

    // 2. Create File Record
    const fileResult = await Core.FileNormalizer.toFile(avatarFile, blobResult.meta.url, pubky);

    // Push file to homeserver
    await homeserver.fetch(fileResult.meta.url, {
      method: 'PUT',
      body: JSON.stringify(fileResult.file.toJson()),
    });
    return fileResult.meta.url;
  }

  static async saveProfile(
    profile: z.infer<typeof Core.UiUserSchema>,
    image: string | null,
    pubky: Core.Pubky,
  ): Promise<Response> {
    try {
      // validate user profile specs
      // Q: What does it happen if the profile is invalid?
      const { user, meta } = await Core.UserNormalizer.to(
        {
          name: profile.name,
          bio: profile.bio ?? '',
          image: image ?? '',
          links: (profile.links ?? []).map((link) => ({ title: link.label, url: link.url })),
          status: '', // default is blank
        },
        pubky,
      );
      const userJson = user.toJson() as PubkyAppUser;

      // save user profile in the global store

      // Write the user profile to the homeserver
      const homeserver = await this.getAuthenticatedHomeserverService();
      const response = await homeserver.fetch(meta.url, {
        method: 'PUT',
        body: JSON.stringify(userJson),
      });
      // if response is OK, save user to global store
      // else, throw specific error for UI to handle
      if (response.ok) {
        // TODO: Also user profile action creator to mutate user profile in the store
        Core.useAuthStore.getState().setCurrentUserPubky(pubky);
        Core.useAuthStore.getState().setAuthenticated(true);
      }
      return response;
    } catch (error) {
      console.error('Failed to save profile', error);
      Core.useAuthStore.getState().setAuthenticated(false);
      Core.useAuthStore.getState().setCurrentUserPubky(null);
      throw error;
    }
  }
}
