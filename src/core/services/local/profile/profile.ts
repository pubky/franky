import * as Core from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';

export class LocalProfileService {
  private constructor() {} // Prevent instantiation

  /**
   * Retrieves user details from local database.
   * @param userId - The user ID to fetch details for
   * @returns Promise resolving to user details or null if not found
   */
  static async details({ userId }: Core.TReadProfileParams): Promise<Core.NexusUserDetails | null> {
    return await Core.UserDetailsModel.findById(userId);
  }

  /**
   * Bulk retrieves multiple user details from local database.
   * @param userIds - Array of user IDs to fetch details for
   * @returns Promise resolving to Map of user ID to user details
   */
  static async bulkDetails(userIds: Core.Pubky[]): Promise<Map<Core.Pubky, Core.NexusUserDetails>> {
    if (userIds.length === 0) return new Map();

    const results = await Core.UserDetailsModel.findByIdsPreserveOrder(userIds);
    const map = new Map<Core.Pubky, Core.NexusUserDetails>();

    for (const details of results) {
      if (details) {
        map.set(details.id, details);
      }
    }

    return map;
  }

  /**
   * Retrieves user counts from local database.
   * @param userId - The user ID to fetch counts for
   * @returns Promise resolving to user counts or null if not found
   */
  static async counts({ userId }: Core.TReadProfileParams): Promise<Core.NexusUserCounts | null> {
    return await Core.UserCountsModel.findById(userId);
  }

  /**
   * Bulk retrieves multiple user counts from local database.
   * @param userIds - Array of user IDs to fetch counts for
   * @returns Promise resolving to Map of user ID to user counts
   */
  static async bulkCounts(userIds: Core.Pubky[]): Promise<Map<Core.Pubky, Core.NexusUserCounts>> {
    if (userIds.length === 0) return new Map();

    const results = await Core.UserCountsModel.findByIdsPreserveOrder(userIds);
    const map = new Map<Core.Pubky, Core.NexusUserCounts>();

    for (const counts of results) {
      if (counts) {
        map.set(counts.id, counts);
      }
    }

    return map;
  }

  /**
   * Bulk retrieves multiple user relationships from local database.
   * @param userIds - Array of user IDs to fetch relationships for
   * @returns Promise resolving to Map of user ID to user relationships
   */
  static async bulkRelationships(userIds: Core.Pubky[]): Promise<Map<Core.Pubky, Core.UserRelationshipsModelSchema>> {
    if (userIds.length === 0) return new Map();

    const results = await Core.UserRelationshipsModel.findByIds(userIds);
    const map = new Map<Core.Pubky, Core.UserRelationshipsModelSchema>();

    for (const relationship of results) {
      if (relationship) {
        map.set(relationship.id, relationship);
      }
    }

    return map;
  }

  /**
   * Retrieves tags for a single user from local database.
   * @param userId - User ID to fetch tags for
   * @returns Promise resolving to array of tags or empty array if not found
   */
  static async getUserTags(userId: string): Promise<Core.NexusTag[]> {
    const userTags = await Core.UserTagsModel.table.get(userId);
    return userTags?.tags ?? [];
  }

  /**
   * Bulk retrieves multiple user tags from local database.
   * @param userIds - Array of user IDs to fetch tags for
   * @returns Promise resolving to Map of user ID to user tags
   */
  static async bulkTags(userIds: Core.Pubky[]): Promise<Map<Core.Pubky, Core.NexusTag[]>> {
    if (userIds.length === 0) return new Map();

    const results = await Core.UserTagsModel.findByIdsPreserveOrder(userIds);
    const map = new Map<Core.Pubky, Core.NexusTag[]>();

    for (const tagsData of results) {
      if (tagsData) {
        map.set(tagsData.id, tagsData.tags);
      }
    }

    return map;
  }

  /**
   * Upserts user details into local database.
   * @param userDetails - The user details to upsert
   * @returns Promise resolving to void
   */
  static async upsert(userDetails: Core.NexusUserDetails): Promise<void> {
    await Core.UserDetailsModel.upsert(userDetails);
  }

  /**
   * Upserts user counts into local database.
   * Creates a new record if it doesn't exist, or replaces it if it does.
   * @param params - Parameters containing user ID
   * @param userCounts - The user counts to upsert
   * @returns Promise resolving to void
   */
  static async upsertCounts(params: Core.TReadProfileParams, userCounts: Core.NexusUserCounts): Promise<void> {
    // Use proper upsert (put) to create the record if it doesn't exist
    await Core.UserCountsModel.upsert({
      id: params.userId,
      ...userCounts,
    });
  }

  /**
   * Upserts user tags into local database.
   * Creates a new record if it doesn't exist, or replaces it if it does.
   * @param userId - The user ID
   * @param tags - The user tags to upsert
   * @returns Promise resolving to void
   */
  static async upsertTags(userId: Core.Pubky, tags: Core.NexusTag[]): Promise<void> {
    await Core.UserTagsModel.upsert({ id: userId, tags });
  }

  /**
   * Deletes the user account from the local database.
   * @returns Promise resolving to void
   */
  static async deleteAccount() {
    try {
      await Core.db.transaction(
        'rw',
        [
          // User tables
          Core.UserCountsModel.table,
          Core.UserDetailsModel.table,
          Core.UserRelationshipsModel.table,
          Core.UserTagsModel.table,
          Core.UserConnectionsModel.table,
          Core.UserTtlModel.table,
          // Post tables
          Core.PostCountsModel.table,
          Core.PostDetailsModel.table,
          Core.PostRelationshipsModel.table,
          Core.PostTagsModel.table,
          Core.PostTtlModel.table,
          // Stream tables
          Core.PostStreamModel.table,
          Core.UserStreamModel.table,
          Core.TagStreamModel.table,
          // Notifications table
          Core.NotificationModel.table,
        ],
        async () => {
          await Promise.all([
            // User tables
            Core.UserCountsModel.clear(),
            Core.UserDetailsModel.clear(),
            Core.UserRelationshipsModel.clear(),
            Core.UserTagsModel.clear(),
            Core.UserConnectionsModel.clear(),
            Core.UserTtlModel.clear(),
            // Post tables
            Core.PostCountsModel.clear(),
            Core.PostDetailsModel.clear(),
            Core.PostRelationshipsModel.clear(),
            Core.PostTagsModel.clear(),
            Core.PostTtlModel.clear(),
            // Stream tables
            Core.PostStreamModel.clear(),
            Core.UserStreamModel.clear(),
            Core.TagStreamModel.clear(),
            // Notifications table
            Core.NotificationModel.clear(),
          ]);
        },
      );

      Logger.debug('Local user data cleared successfully');
    } catch (error) {
      Logger.error('Failed to clear local user data', { error });
      throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, 'Failed to clear local user data', 500, {
        error,
      });
    }
  }
}
