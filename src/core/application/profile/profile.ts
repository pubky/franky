import JSZip from 'jszip';

import * as Specs from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class ProfileApplication {
  private constructor() {} // Prevent instantiation

  static async read({ userId }: Core.TReadProfileParams) {
    // Try to get from local database first
    const localUserDetails = await Core.UserDetailsModel.findById(userId);

    // If found locally, return it
    if (localUserDetails) {
      return localUserDetails;
    }

    // If not found locally, fetch from Nexus API
    try {
      const nexusUserDetails = await Core.NexusUserService.details({ user_id: userId });

      // If found from Nexus, persist it to local database
      if (nexusUserDetails) {
        await Core.UserDetailsModel.upsert(nexusUserDetails);
        return await Core.UserDetailsModel.findById(userId);
      }
    } catch (error) {
      // Handle 404 (user not found) gracefully - profile.json was not created yet
      if (error instanceof Libs.AppError && error.statusCode === 404) {
        // User doesn't exist in Nexus yet, return null
        return null;
      }
      // Re-throw other errors (network issues, server errors, etc.)
      throw error;
    }
  }

  /**
   * Bulk read multiple user details from local database.
   * Returns a Map for efficient lookup by user ID.
   */
  static async bulkRead(userIds: Core.Pubky[]): Promise<Map<Core.Pubky, Core.NexusUserDetails>> {
    return await Core.LocalProfileService.bulkDetails(userIds);
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
    await Core.LocalProfileService.deleteAccount();

    const baseDirectory = Specs.baseUriBuilder(pubky);
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

  /**
   * Updates user status in both homeserver and local database.
   * Follows local-first pattern: updates homeserver first, then local DB.
   *
   * According to PubkyAppUser spec:
   * - URI: /pub/pubky.app/profile.json
   * - status field: Optional, max 50 characters
   * - Must send complete profile object (name, bio, image, links, status)
   *
   * @see https://github.com/pubky/pubky-app-specs#pubkyappuser
   * @param params - Parameters containing user's public key and status
   */
  static async update({ pubky, status }: { pubky: Core.Pubky; status: string }) {
    try {
      // Get current user details from local DB
      const currentUser = await Core.UserDetailsModel.findById(pubky);
      if (!currentUser) {
        throw new Error('User profile not found');
      }

      // Build complete user object with updated status
      // According to spec, we must send the full profile, not just the status field
      const { user, meta } = Core.UserNormalizer.to(
        {
          name: currentUser.name,
          bio: currentUser.bio,
          image: currentUser.image ?? '',
          links: (currentUser.links ?? []).map((link) => ({ title: link.title, url: link.url })),
          status: status || '',
        },
        pubky,
      );

      // Update homeserver with complete profile
      await Core.HomeserverService.request(Core.HomeserverAction.PUT, meta.url, user.toJson());

      // Update local database after successful homeserver sync
      await Core.UserDetailsModel.upsert({
        ...currentUser,
        status: status || null,
      });
    } catch (error) {
      console.error('Failed to update status', { error, pubky, status });
      throw error;
    }
  }

  /**
   * Downloads all user data from the homeserver and packages it into a ZIP file.
   * Fetches all files at once (using Infinity limit), formats JSON files with indentation, and preserves binary files.
   * Automatically triggers a browser download of the generated ZIP file.
   * @param params - Parameters containing user's public key and optional progress callback
   */
  static async downloadData({ pubky, setProgress }: Core.TDownloadDataParams) {
    const baseDirectory = Specs.baseUriBuilder(pubky);

    // TODO: Using undefined, false, and Infinity here as a temporary workaround since homeserver.list does not yet
    // support pagination. This ensures all files are retrieved.
    const dataList = await Core.HomeserverService.list(baseDirectory, undefined, false, Infinity);

    // Create JSZip instance and data folder
    const zip = new JSZip();
    const dataFolder = zip.folder('data');

    if (!dataFolder) {
      throw new Error("Error creating 'data' folder in zip.");
    }

    const totalFiles = dataList.length;

    // Fetch each file and add to zip
    await Promise.all(
      dataList.map(async (dataUrl, index) => {
        const response = await Core.HomeserverService.get(dataUrl);
        const arrayBuffer = await response.arrayBuffer();
        const fileName = dataUrl.split(`pubky://${pubky}/`)[1];

        // Try to parse as JSON and format with indentation, fallback to binary for non-JSON files
        try {
          const decoder = new TextDecoder('utf-8');
          const decodedString = decoder.decode(arrayBuffer);
          const parsedData = JSON.parse(decodedString);
          dataFolder.file(fileName, JSON.stringify(parsedData, null, 2));
        } catch {
          dataFolder.file(fileName, new Uint8Array(arrayBuffer), { binary: true });
        }

        if (setProgress) {
          setProgress(Math.round(((index + 1) / totalFiles) * 100));
        }
      }),
    );

    // Generate zip blob and trigger download
    const now = new Date();
    const formattedDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pubky}_${formattedDateTime}_pubky.app.zip`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
