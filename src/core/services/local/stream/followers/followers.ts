import * as Core from '@/core';

/**
 * Local Stream Followers Service
 *
 * Simple service to manage followers stream IDs in IndexDB.
 * Only stores arrays of user IDs (Pubky), no user data.
 */
export class LocalStreamFollowersService {
  private constructor() {}

  /**
   * Save or update a stream of follower IDs
   */
  static async upsert({ streamId, stream }: Core.TFollowersStreamUpsertParams): Promise<void> {
    await Core.UserStreamModel.upsert(streamId, stream);
  }

  /**
   * Get a stream of follower IDs by stream ID
   */
  static async findById(streamId: Core.UserStreamTypes): Promise<{ stream: Core.Pubky[] } | null> {
    return await Core.UserStreamModel.findById(streamId);
  }

  /**
   * Delete a followers stream from cache
   */
  static async deleteById(streamId: Core.UserStreamTypes): Promise<void> {
    await Core.UserStreamModel.deleteById(streamId);
  }

  /**
   * Persist user data to normalized tables
   * Separates user details, counts, tags, and relationships
   *
   * @param users - Array of users from Nexus API
   * @returns Array of user IDs (Pubky)
   */
  static async persistUsers(users: Core.NexusUser[]): Promise<Core.Pubky[]> {
    const userCounts: Core.NexusModelTuple<Core.NexusUserCounts>[] = [];
    const userRelationships: Core.NexusModelTuple<Core.NexusUserRelationship>[] = [];
    const userTags: Core.NexusModelTuple<Core.NexusTag[]>[] = [];
    const userDetails: Core.UserDetailsModelSchema[] = [];

    const userIds: Core.Pubky[] = [];

    for (const user of users) {
      const userId = user.details.id;
      userIds.push(userId);
      userCounts.push([userId, user.counts]);
      userRelationships.push([userId, user.relationship]);

      // Convert tags to NexusTag format
      const nexusTags = user.tags.map((tag) => ({
        label: tag.label,
        taggers: tag.taggers,
        taggers_count: tag.taggers_count,
        relationship: tag.relationship,
      }));
      userTags.push([userId, nexusTags]);

      // User details already in correct format
      userDetails.push(user.details);
    }

    // Bulk save to normalized tables
    await Promise.all([
      Core.UserDetailsModel.bulkSave(userDetails),
      Core.UserCountsModel.bulkSave(userCounts),
      Core.UserTagsModel.bulkSave(userTags),
      Core.UserRelationshipsModel.bulkSave(userRelationships),
    ]);

    return userIds;
  }

  /**
   * Append new user IDs to an existing followers stream
   * Used for pagination - adds next page of users to the end of the stream
   *
   * @param stream - Array of new user IDs to append
   * @param streamId - ID of the stream to update
   * @throws Error if stream does not exist
   */
  static async persistNewStreamChunk({ stream, streamId }: Core.TFollowersStreamUpsertParams): Promise<void> {
    const userStream = await Core.UserStreamModel.findById(streamId);
    if (!userStream) {
      throw new Error(`Followers stream not found: ${streamId}`);
    }
    await Core.UserStreamModel.upsert(streamId, [...userStream.stream, ...stream]);
  }
}
