import * as Core from '@/core';

/**
 * Local Stream Users Service
 *
 * Simple service to manage user stream IDs in IndexedDB.
 * Only stores arrays of user IDs (Pubky), no user data.
 * Handles followers, following, friends, and other user stream types.
 */
export class LocalStreamUsersService {
  private constructor() {}

  /**
   * Save or update a stream of user IDs
   * @param streamId - Composite ID in format 'userId:streamType' (e.g., 'user-ABC:followers')
   */
  static async upsert({ streamId, stream }: Core.TUserStreamUpsertParams): Promise<void> {
    await Core.UserStreamModel.upsert(streamId, stream);
  }

  /**
   * Get a stream of user IDs by stream ID
   * @param streamId - Composite ID in format 'userId:streamType' (e.g., 'user-ABC:followers')
   */
  static async findById(streamId: string): Promise<{ stream: Core.Pubky[] } | null> {
    return await Core.UserStreamModel.findById(streamId);
  }

  /**
   * Delete a user stream from cache
   * @param streamId - Composite ID in format 'userId:streamType' (e.g., 'user-ABC:followers')
   */
  static async deleteById(streamId: string): Promise<void> {
    await Core.UserStreamModel.deleteById(streamId);
  }

  /**
   * Prepend user ID(s) to a stream
   * Only adds users if not already present
   *
   * @param streamId - The stream to prepend to
   * @param userIds - The user ID(s) to prepend
   */
  static async prependToStream(streamId: Core.UserStreamId, userIds: Core.Pubky[]): Promise<void> {
    await Core.UserStreamModel.prependItems(streamId, userIds);
  }

  /**
   * Remove user ID(s) from a stream
   *
   * @param streamId - The stream to remove from
   * @param userIds - The user ID(s) to remove
   */
  static async removeFromStream(streamId: Core.UserStreamId, userIds: Core.Pubky[]): Promise<void> {
    await Core.UserStreamModel.removeItems(streamId, userIds);
  }

  /**
   * Find which users are not yet persisted in cache
   * Used to identify missing user data that needs to be fetched
   *
   * @param userIds - Array of user IDs to check
   * @returns Array of user IDs that are not persisted in cache
   */
  static async getNotPersistedUsersInCache(userIds: Core.Pubky[]): Promise<Core.Pubky[]> {
    const existingUserIds = await Core.UserDetailsModel.findByIdsPreserveOrder(userIds);
    return userIds.filter((_userId, index) => existingUserIds[index] === undefined);
  }

  /**
   * Persist user data to normalized tables
   * Separates user details, counts, tags, relationships, and TTL records
   * Also detects and persists moderation status for flagged profiles
   *
   * @param users - Array of users from Nexus API
   * @returns Array of user IDs (Pubky)
   */
  static async persistUsers(users: Core.NexusUser[]): Promise<Core.Pubky[]> {
    const userCounts: Core.NexusModelTuple<Core.NexusUserCounts>[] = [];
    const userRelationships: Core.NexusModelTuple<Core.NexusUserRelationship>[] = [];
    const userTags: Core.NexusModelTuple<Core.NexusTag[]>[] = [];
    const userDetails: Core.UserDetailsModelSchema[] = [];
    const userModerations: Core.ModerationModelSchema[] = [];
    const userTtl: Core.NexusModelTuple<{ lastUpdatedAt: number }>[] = [];

    const userIds: Core.Pubky[] = [];
    const now = Date.now();

    for (const user of users) {
      const userId = user.details.id;
      userIds.push(userId);
      userCounts.push([userId, user.counts]);
      userRelationships.push([userId, user.relationship]);
      userTags.push([userId, user.tags]);
      userDetails.push(user.details);
      userTtl.push([userId, { lastUpdatedAt: now }]);

      // Detect moderation from user tags
      const isModerated = Core.detectModerationFromTags(user.tags);
      if (isModerated) {
        userModerations.push({
          id: userId,
          type: Core.ModerationType.PROFILE,
          is_blurred: true,
          created_at: Date.now(),
        });
      }
    }

    // Bulk save to normalized tables
    await Promise.all([
      Core.UserDetailsModel.bulkSave(userDetails),
      Core.UserCountsModel.bulkSave(userCounts),
      Core.UserTagsModel.bulkSave(userTags),
      Core.UserRelationshipsModel.bulkSave(userRelationships),
      Core.UserTtlModel.bulkSave(userTtl),
      // Persist moderation records for flagged profiles
      userModerations.length > 0 ? Core.ModerationModel.bulkSave(userModerations) : Promise.resolve(),
    ]);

    return userIds;
  }
}
