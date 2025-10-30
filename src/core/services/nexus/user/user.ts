import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * Nexus User Service
 *
 * Handles fetching user data from Nexus API.
 */
export class NexusUserService {
  /**
   * Retrieves user data from Nexus API
   *
   * @param pubky - User's public key
   * @returns user data (users, posts, streams)
   */
  static async notifications(params: Core.TUserPaginationParams): Promise<Core.NexusNotification[]> {
    const url = Core.userApi.notifications(params);
    const notificationList = await Core.queryNexus<Core.NexusNotification[]>(url);
    Libs.Logger.debug(`Notifications fetched successfully!`);
    return notificationList;
  }
}
