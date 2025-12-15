import * as Core from '@/core';
import * as Libs from '@/libs';

export class UserController {
  private constructor() {} // Prevent instantiation

  /**
   * Get user details from local database
   * This is a read-only operation that queries the local cache
   */
  static async getDetails(param: Core.TReadProfileParams): Promise<Core.NexusUserDetails | null> {
    return await Core.ProfileApplication.getDetails(param);
  }

  /**
   * Get user details from local database or fetch from Nexus API
   * This is a read-only operation that queries the local cache
   */
  static async getOrFetchDetails(param: Core.TReadProfileParams): Promise<Core.NexusUserDetails | null> {
    return await Core.UserApplication.getOrFetchDetails(param);
  }

  /**
   * Get user counts from local database
   * This is a read-only operation that queries the local cache
   */
  static async getCounts({ userId }: Core.TReadProfileParams): Promise<Core.NexusUserCounts | null> {
    return await Core.UserApplication.getCounts({ userId });
  }

  /**
   * Retrieves tags for a user from local IndexedDB.
   * @param userId - User ID to get tags for
   * @returns Promise resolving to an array of tags or empty array if not found
   */
  static async getUserTags(userId: string): Promise<Core.NexusTag[]> {
    return await Core.UserApplication.getUserTags(userId);
  }

  /**
   * Get user relationships from local database
   * This is a read-only operation that queries the local cache
   */
  static async getUserRelationships(params: Core.TReadProfileParams): Promise<Core.NexusUserRelationship | null> {
    return await Core.UserApplication.getUserRelationships(params);
  }

  /**
   * Get multiple user details from local database (bulk operation)
   * This is a read-only operation that queries the local cache
   */
  static async bulkGetDetails(userIds: Core.Pubky[]): Promise<Map<Core.Pubky, Core.NexusUserDetails>> {
    return await Core.ProfileApplication.bulkRead(userIds);
  }

  /**
   * Get multiple user counts from local database (bulk operation)
   * This is a read-only operation that queries the local cache
   */
  static async bulkGetCounts(userIds: Core.Pubky[]): Promise<Map<Core.Pubky, Core.NexusUserCounts>> {
    return await Core.UserApplication.bulkCounts(userIds);
  }

  /**
   * Get multiple user relationships from local database (bulk operation)
   * This is a read-only operation that queries the local cache
   */
  static async bulkGetRelationships(
    userIds: Core.Pubky[],
  ): Promise<Map<Core.Pubky, Core.UserRelationshipsModelSchema>> {
    return await Core.UserApplication.bulkRelationships(userIds);
  }

  /**
   * Get multiple user tags with local-first strategy (bulk operation)
   * Reads from cache first, fetches from API only for missing users
   */
  static async bulkGetTags(userIds: Core.Pubky[]): Promise<Map<Core.Pubky, Core.NexusTag[]>> {
    return await Core.UserApplication.bulkTagsWithFetch(userIds);
  }

  static async follow(eventType: Core.HomeserverAction, { follower, followee }: Core.TFollowParams) {
    const { meta, follow } = Core.FollowNormalizer.to({ follower, followee });

    // Get active stream ID from store (controller layer responsibility)
    const activeStreamId = this.getActiveStreamId();

    await Core.UserApplication.follow({
      eventType,
      followUrl: meta.url,
      followJson: follow.toJson(),
      follower,
      followee,
      activeStreamId,
    });
  }

  static async mute(eventType: Core.HomeserverAction, { muter, mutee }: Core.TMuteParams) {
    const { meta, mute } = Core.MuteNormalizer.to({ muter, mutee });
    await Core.UserApplication.mute({
      eventType,
      muteUrl: meta.url,
      muteJson: mute.toJson(),
      muter,
      mutee,
    });
  }

  static async tags(params: Core.TUserTagsParams): Promise<Core.NexusTag[]> {
    return await Core.UserApplication.tags(params);
  }

  /**
   * Saves tags for a user to local IndexedDB.
   * @param userId - User ID to save tags for
   * @param tags - Array of tags to save
   */
  static async saveUserTags(userId: string, tags: Core.NexusTag[]): Promise<void> {
    await Core.UserApplication.saveUserTags(userId, tags);
  }

  static async taggers(params: Core.TUserTaggersParams): Promise<Core.NexusUser[]> {
    return await Core.UserApplication.taggers(params);
  }

  /**
   * Gets the currently active stream ID from the home store if on /home route.
   * This is a controller responsibility - controllers can access UI state stores.
   *
   * @returns The active stream ID, or null if not on /home route or if retrieval fails
   */
  static getActiveStreamId(): Core.PostStreamTypes | null {
    if (typeof window === 'undefined' || window.location.pathname !== '/home') {
      return null;
    }

    try {
      const homeState = Core.useHomeStore.getState();
      return Core.getStreamId(homeState.sort, homeState.reach, homeState.content);
    } catch (error) {
      Libs.Logger.warn('Failed to get active stream ID', { error });
      return null;
    }
  }
}
