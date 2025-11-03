import { baseUriBuilder } from 'pubky-app-specs';
import JSZip from 'jszip';
import * as Core from '@/core';

export class UserApplication {
  /**
   * Handles following or unfollowing a user.
   * Performs local database operations and syncs with the homeserver.
   * @param params - Parameters containing event type, URLs, JSON data, and user IDs
   */
  static async follow({ eventType, followUrl, followJson, follower, followee }: Core.TUserApplicationFollowParams) {
    if (eventType === Core.HomeserverAction.PUT) {
      await Core.LocalFollowService.create({ follower, followee });
    } else if (eventType === Core.HomeserverAction.DELETE) {
      await Core.LocalFollowService.delete({ follower, followee });
    }
    await Core.HomeserverService.request(eventType, followUrl, followJson);
  }

  static async downloadData({ pubky, setProgress }: Core.TDownloadDataParams) {
    const baseDirectory = baseUriBuilder(pubky);
    const dataList: string[] = [];
    const limit = 500;
    let cursor: string | undefined = undefined;

    // Gather the list of files from homeserver using pagination
    while (true) {
      const batch = await Core.HomeserverService.list(baseDirectory, cursor, false, limit);

      if (batch.length === 0) {
        break;
      }

      dataList.push(...batch);
      cursor = batch[batch.length - 1];
    }

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

        // Try to parse as JSON, fallback to binary
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

    // Generate zip blob
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

  /**
   * Handles muting or unmuting a user.
   * Performs local database operations and syncs with the homeserver.
   * @param params - Parameters containing event type, URLs, JSON data, and user IDs
   */
  static async mute({ eventType, muteUrl, muteJson, muter, mutee }: Core.TUserApplicationMuteParams) {
    if (eventType === Core.HomeserverAction.PUT) {
      await Core.LocalMuteService.create({ muter, mutee });
      await Core.HomeserverService.request(eventType, muteUrl, muteJson);
      return;
    }

    if (eventType === Core.HomeserverAction.DELETE) {
      await Core.LocalMuteService.delete({ muter, mutee });
      await Core.HomeserverService.request(eventType, muteUrl, muteJson);
      return;
    }
  }

  /**
   * Retrieves notifications from the nexus service and persists them locally,
   * then returns the count of unread notifications.
   * @param params - Parameters containing user ID and last read timestamp
   * @returns Promise resolving to the number of unread notifications
   */
  static async notifications({ userId, lastRead }: Core.TUserApplicationNotificationsParams): Promise<number> {
    const notificationList = await Core.NexusUserService.notifications({ user_id: userId, end: lastRead });
    return await Core.LocalNotificationService.persitAndGetUnreadCount(notificationList, lastRead);
  }
}
