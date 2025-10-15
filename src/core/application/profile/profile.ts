import * as Core from '@/core';

export class ProfileApplication {
  private constructor() {} // Prevent instantiation

  static async read({ userId }: Core.TReadProfileParams) {
    // TODO: get from nexus api if not found in database
    return await Core.UserDetailsModel.findById(userId);
  }

  static async uploadAvatar({ blobResult, fileResult }: Core.TUploadAvatarInput) {
    // 1. Upload Blob
    await Core.HomeserverService.putBlob(blobResult.meta.url, blobResult.blob.data);
    // 2. Create File Record
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, fileResult.meta.url, fileResult.file.toJson());
  }

  static async create({ profile, url, pubky }: Core.TCreateProfileInput) {
    try {
      await Core.HomeserverService.request(Core.HomeserverAction.PUT, url, profile.toJson());
      const authStore = Core.useAuthStore.getState();
      authStore.setCurrentUserPubky(pubky);
      authStore.setAuthenticated(true);
    } catch (error) {
      const authStore = Core.useAuthStore.getState();
      authStore.setAuthenticated(false);
      authStore.setCurrentUserPubky(null);
      throw error;
    }
  }
}
