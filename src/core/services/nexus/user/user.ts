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
    let notificationList = await Core.queryNexus<Core.NexusNotification[]>(url);
    if (!notificationList) notificationList = [];
    Libs.Logger.debug(`Notifications fetched successfully!`);
    return notificationList;
  }

  /**
   * Retrieves tags for a user from Nexus API
   *
   * @param params - Parameters containing user ID and pagination options
   * @returns Array of tags assigned to the user
   */
  static async tags(params: Core.TUserTagsParams): Promise<Core.NexusTag[]> {
    const url = Core.userApi.tags(params);
    let tagList = await Core.queryNexus<Core.NexusTag[]>(url);
    if (!tagList) tagList = [];
    Libs.Logger.debug(`User tags fetched successfully! Returned ${tagList.length} tags`);
    return tagList;
  }

  /**
   * Retrieves taggers for a specific tag label on a user from Nexus API
   *
   * @param params - Parameters containing user ID, label, and pagination options
   * @returns Array of users who tagged the user with the specified label
   */
  static async taggers(params: Core.TUserTaggersParams): Promise<Core.NexusUser[]> {
    const url = Core.userApi.taggers(params);
    let taggerList = await Core.queryNexus<Core.NexusUser[]>(url);
    if (!taggerList) taggerList = [];
    Libs.Logger.debug(`User taggers fetched successfully! Returned ${taggerList.length} taggers`);
    return taggerList;
  }

  /**
   * Retrieves user details from Nexus API
   *
   * @param params - Parameters containing user ID
   * @returns User details including name, bio, status, image, and links
   */
  static async details(params: Core.TUserId): Promise<Core.NexusUserDetails | undefined> {
    const url = Core.userApi.details(params);
    const userDetails = await Core.queryNexus<Core.NexusUserDetails>(url);
    if (userDetails) {
      Libs.Logger.debug(`User details fetched successfully for user ${params.user_id}`);
    }
    return userDetails;
  }

  /**
   * Retrieves user counts from Nexus API
   *
   * @param params - Parameters containing user ID
   * @returns User counts including followers, following, and friends
   */
  static async counts(params: Core.TUserId): Promise<Core.NexusUserCounts | undefined> {
    const url = Core.userApi.counts(params);
    const userCounts = await Core.queryNexus<Core.NexusUserCounts>(url);
    if (userCounts) {
      Libs.Logger.debug(`User counts fetched successfully for user ${params.user_id}`);
    }
    return userCounts;
  }
}
