import { baseUriBuilder } from 'pubky-app-specs';
import * as Core from '@/core';
import type { TUserApplicationFollowParams, TDeleteAccountParams } from './user.types';

export class UserApplication {
  static async follow({ eventType, followUrl, followJson, follower, followee }: TUserApplicationFollowParams) {
    if (eventType === Core.HomeserverAction.PUT) {
      await Core.Local.Follow.create({ follower, followee });
    } else if (eventType === Core.HomeserverAction.DELETE) {
      await Core.Local.Follow.delete({ follower, followee });
    }
    await Core.HomeserverService.request(eventType, followUrl, followJson);
  }

  static async deleteAccount({ pubky, setProgress }: TDeleteAccountParams) {
    // Clear local IndexedDB data first
    await Core.Local.User.deleteAccount();

    const baseDirectory = baseUriBuilder(pubky);
    const dataList = await Core.HomeserverService.list(baseDirectory);

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
