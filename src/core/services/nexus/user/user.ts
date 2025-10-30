import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * Nexus Bootstrap Service
 *
 * Handles fetching bootstrap data from Nexus API.
 */
export class NexusUserService {
  /**
   * Retrieves bootstrap data from Nexus API
   *
   * @param pubky - User's public key
   * @returns Bootstrap data (users, posts, streams)
   */
  static async notifications(params: Core.TUserPaginationParams): Promise<Core.NexusNotification[]> {
    const url = Core.userApi.notifications(params);
    const notificationList = await Core.queryNexus<Core.NexusNotification[]>(url);
    Libs.Logger.debug(`Notifications fetched successfully!`);
    return notificationList;
  }
}
