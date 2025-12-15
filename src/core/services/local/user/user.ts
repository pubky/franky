import * as Core from '@/core';

export class LocalUserService {
  private constructor() {} // Prevent instantiation

  /**
   * Retrieves user details from local database.
   * @param userId - User ID to fetch details for
   * @returns Promise resolving to user details or null if not found
   */
  static async getDetails({ userId }: Core.TReadProfileParams): Promise<Core.NexusUserDetails | null> {
    return await Core.UserDetailsModel.findById(userId);
  }

  /**
   * Bulk retrieves multiple user details from local database.
   * @param userIds - Array of user IDs to fetch details for
   * @returns Promise resolving to Map of user ID to user details
   */
  static async getManyDetails({ userIds }: Core.TPubkyListParams): Promise<Map<Core.Pubky, Core.NexusUserDetails>> {
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
  static async getCounts({ userId }: Core.TReadProfileParams): Promise<Core.NexusUserCounts | null> {
    return await Core.UserCountsModel.findById(userId);
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
   * Bulk retrieves multiple user counts from local database.
   * @param userIds - Array of user IDs to fetch counts for
   * @returns Promise resolving to Map of user ID to user counts
   */
  static async getManyCounts({ userIds }: Core.TPubkyListParams): Promise<Map<Core.Pubky, Core.NexusUserCounts>> {
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

  static async getRelationships({ userId }: Core.TReadProfileParams): Promise<Core.NexusUserRelationship | null> {
    return await Core.UserRelationshipsModel.findById(userId);
  }

  /**
   * Bulk retrieves multiple user relationships from local database.
   * @param userIds - Array of user IDs to fetch relationships for
   * @returns Promise resolving to Map of user ID to user relationships
   */
  static async getManyRelationships({
    userIds,
  }: Core.TPubkyListParams): Promise<Map<Core.Pubky, Core.UserRelationshipsModelSchema>> {
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
  static async getTags({ userId }: Core.TReadProfileParams): Promise<Core.NexusTag[]> {
    const userTags = await Core.UserTagsModel.findById(userId);
    return userTags?.tags ?? [];
  }

  /**
   * Bulk retrieves multiple user tags from local database.
   * @param userIds - Array of user IDs to fetch tags for
   * @returns Promise resolving to Map of user ID to user tags
   */
  static async getManyTags({ userIds }: Core.TPubkyListParams): Promise<Map<Core.Pubky, Core.NexusTag[]>> {
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
   * Upserts user tags into local database.
   * Creates a new record if it doesn't exist, or replaces it if it does.
   * @param userId - The user ID
   * @param tags - The user tags to upsert
   * @returns Promise resolving to void
   */
  static async upsertTags(userId: Core.Pubky, tags: Core.NexusTag[]): Promise<void> {
    await Core.UserTagsModel.upsert({ id: userId, tags });
  }
}
