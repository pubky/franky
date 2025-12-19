import * as Core from '@/core';

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
    // TODO: Handle the error in application layer
    const url = Core.userApi.notifications(params);
    return await Core.queryNexus<Core.NexusNotification[]>(url);
  }

  /**
   * Retrieves tags for a user from Nexus API
   *
   * @param params - Parameters containing user ID and pagination options
   * @returns Array of tags assigned to the user
   */
  static async tags(params: Core.TUserTagsParams): Promise<Core.NexusTag[]> {
    // TODO: Handle the error in application layer
    const url = Core.userApi.tags(params);
    return await Core.queryNexus<Core.NexusTag[]>(url);
  }

  /**
   * Retrieves taggers for a specific tag label on a user from Nexus API
   *
   * @param params - Parameters containing user ID, label, and pagination options
   * @returns Array of users who tagged the user with the specified label
   */
  static async taggers(params: Core.TUserTaggersParams): Promise<Core.NexusTaggers[]> {
    // TODO: Handle the error in application layer
    const url = Core.userApi.taggers(params);
    return await Core.queryNexus<Core.NexusTaggers[]>(url);
  }

  /**
   * Retrieves user details from Nexus API
   *
   * @param params - Parameters containing user ID
   * @returns User details including name, bio, status, image, and links
   */
  static async details(params: Core.TUserId): Promise<Core.NexusUserDetails> {
    // TODO: Handle the error in application layer
    const url = Core.userApi.details(params);
    return await Core.queryNexus<Core.NexusUserDetails>(url);
  }

  /**
   * Retrieves user counts from Nexus API
   *
   * @param params - Parameters containing user ID
   * @returns User counts including followers, following, and friends
   */
  static async counts(params: Core.TUserId): Promise<Core.NexusUserCounts> {
    // TODO: Handle the error in application layer
    const url = Core.userApi.counts(params);
    return await Core.queryNexus<Core.NexusUserCounts>(url);
  }
}
