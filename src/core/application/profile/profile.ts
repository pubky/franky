import { baseUriBuilder } from 'pubky-app-specs';
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

  static async deleteAccount({ pubky, setProgress }: Core.TDeleteAccountParams) {
    // Clear local IndexedDB data first
    await Core.Local.Profile.deleteAccount();

    const baseDirectory = baseUriBuilder(pubky);
    // TODO: Using undefined, false, and Infinity here as a temporary workaround since
    // homeserver.list does not yet support pagination. This ensures all files are deleted.
    const dataList = await Core.HomeserverService.list(baseDirectory, undefined, false, Infinity);

    // Separate profile.json and other files
    const profileUrl = `${baseDirectory}profile.json`;
    const filesToDelete = dataList.filter((file) => file !== profileUrl);

    // Sort remaining files alphanumerically and reverse
    filesToDelete.sort().reverse();

    // Total files including profile.json for progress calculation
    const totalFiles = filesToDelete.length + 1;

    // Delete each file (excluding profile.json) and update progress
    for (let index = 0; index < filesToDelete.length; index++) {
      await Core.HomeserverService.delete(filesToDelete[index]);

      if (!setProgress) {
        continue;
      }

      setProgress(Math.round(((index + 1) / totalFiles) * 100));
    }

    // Finally, delete profile.json and update progress to 100%
    await Core.HomeserverService.delete(profileUrl);

    if (setProgress) {
      setProgress(100);
    }
  }
}
