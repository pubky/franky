import * as Core from '@/core';
import { TUploadAvatarInput, TCreateProfileInput } from './profile.types';

export class ProfileApplication {
  private constructor() {} // Prevent instantiation

  static async uploadAvatar({ blobResult, fileResult }: TUploadAvatarInput) {
    // 1. Upload Blob
    await Core.HomeserverService.putBlob(blobResult.meta.url, blobResult.blob.data);
    // 2. Create File Record
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, fileResult.meta.url, fileResult.file.toJson());
  }

  static async create({ profile, url, pubky }: TCreateProfileInput) {
    try {
      await Core.HomeserverService.request(Core.HomeserverAction.PUT, url, profile.toJson());
      // Initialise authentication store
      Core.useAuthStore.getState().setCurrentUserPubky(pubky);
      Core.useAuthStore.getState().setAuthenticated(true);
    } catch (error) {
      Core.useAuthStore.getState().setAuthenticated(false);
      Core.useAuthStore.getState().setCurrentUserPubky(null);
      throw error;
    }
  }
}
