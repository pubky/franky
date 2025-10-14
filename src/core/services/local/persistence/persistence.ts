import * as Core from '@/core';
import { Logger } from '@/libs';

/**
 * Local Persistence Service
 *
 * Handles persistence of data fetched from external sources (Nexus API) to local database.
 * This service is responsible for transforming and storing:
 * - Users (details, counts, relationships, tags)
 * - Posts (details, counts, relationships, tags)
 * - Streams (timeline, influencers, recommended, hot tags)
 */
export class LocalPersistenceService {
  /**
   * Persists user data to local database
   *
   * @param users - Array of users from Nexus API
   */
  static async persistUsers(users: Core.NexusUser[]): Promise<void> {
    try {
      await Promise.all([
        Core.UserCountsModel.bulkSave(users.map((user) => [user.details.id, user.counts])),
        Core.UserDetailsModel.bulkSave(users.map((user) => user.details)),
        Core.UserRelationshipsModel.bulkSave(users.map((user) => [user.details.id, user.relationship])),
        Core.UserTagsModel.bulkSave(users.map((user) => [user.details.id, user.tags])),
      ]);

      Logger.debug('Users persisted successfully', { count: users.length });
    } catch (error) {
      Logger.error('Failed to persist users', { error, count: users.length });
      throw error;
    }
  }

  /**
   * Persists post data to local database
   *
   * Posts use composite IDs (authorId:postId) to ensure uniqueness across authors.
   * The author field is removed from post details as it's encoded in the composite ID.
   *
   * @param posts - Array of posts from Nexus API
   */
  static async persistPosts(posts: Core.NexusPost[]): Promise<void> {
    try {
      const postCounts: Core.NexusModelTuple<Core.NexusPostCounts>[] = [];
      const postRelationships: Core.NexusModelTuple<Core.NexusPostRelationships>[] = [];
      const postTags: Core.NexusModelTuple<Core.NexusTag[]>[] = [];
      const postDetails: Core.RecordModelBase<string, Core.PostDetailsModelSchema>[] = [];

      for (const post of posts) {
        // Build composite ID to ensure uniqueness (authorId:postId)
        const postId = Core.buildPostCompositeId({ pubky: post.details.author, postId: post.details.id });

        postCounts.push([postId, post.counts]);
        postRelationships.push([postId, post.relationships]);

        // Convert TagModel[] to NexusTag[] by accessing the data property
        const nexusTags = post.tags.map((tag) => ({
          label: tag.label,
          taggers: tag.taggers,
          taggers_count: tag.taggers_count,
          relationship: tag.relationship,
        }));
        postTags.push([postId, nexusTags]);

        // Remove author from details as it's in the composite ID
        // eslint-disable-next-line
        const { author, ...detailsWithoutAuthor } = post.details;
        postDetails.push({ ...detailsWithoutAuthor, id: postId });
      }

      await Promise.all([
        Core.PostDetailsModel.bulkSave(postDetails),
        Core.PostCountsModel.bulkSave(postCounts),
        Core.PostTagsModel.bulkSave(postTags),
        Core.PostRelationshipsModel.bulkSave(postRelationships),
      ]);

      Logger.debug('Posts persisted successfully', { count: posts.length });
    } catch (error) {
      Logger.error('Failed to persist posts', { error, count: posts.length });
      throw error;
    }
  }

  /**
   * Persists stream data to local cache
   *
   * Stores different types of streams:
   * - Post streams (timeline)
   * - User streams (influencers, recommended)
   * - Tag streams (hot tags)
   *
   * @param list - Stream lists from Nexus API
   */
  static async persistStreams(list: Core.NexusBootstrapList): Promise<void> {
    try {
      await Promise.all([
        Core.PostStreamModel.upsert(Core.PostStreamTypes.TIMELINE_ALL, list.stream),
        Core.UserStreamModel.upsert(Core.UserStreamTypes.TODAY_INFLUENCERS_ALL, list.influencers),
        Core.UserStreamModel.upsert(Core.UserStreamTypes.RECOMMENDED, list.recommended),
        Core.TagStreamModel.upsert(Core.TagStreamTypes.TODAY_ALL, list.hot_tags),
      ]);

      Logger.debug('Streams persisted successfully', {
        posts: list.stream.length,
        influencers: list.influencers.length,
        recommended: list.recommended.length,
        hotTags: list.hot_tags.length,
      });
    } catch (error) {
      Logger.error('Failed to persist streams', { error });
      throw error;
    }
  }

  /**
   * Persists complete bootstrap data to local database
   *
   * Convenience method that persists all bootstrap data at once:
   * - Users (details, counts, relationships, tags)
   * - Posts (details, counts, relationships, tags)
   * - Streams (timeline, influencers, recommended, hot tags)
   *
   * @param data - Complete bootstrap data from Nexus API
   */
  static async persistBootstrap(data: Core.NexusBootstrapResponse): Promise<void> {
    try {
      await Promise.all([this.persistUsers(data.users), this.persistPosts(data.posts), this.persistStreams(data.list)]);

      Logger.debug('Bootstrap data persisted successfully', {
        users: data.users.length,
        posts: data.posts.length,
        streams: {
          timeline: data.list.stream.length,
          influencers: data.list.influencers.length,
          recommended: data.list.recommended.length,
          hotTags: data.list.hot_tags.length,
        },
      });
    } catch (error) {
      Logger.error('Failed to persist bootstrap data', { error });
      throw error;
    }
  }

  static async persistUserStream(users: string[]): Promise<void> {
    try {
      // fetch all the users in the posts
      const filteredUsers = await Core.UserDetailsModel.findByIdsPreserveOrder(users);

      // now get the user id from the filtededUSers that are undefined,
      // I want to search from nexus api those undefined users

      // get the users that are undefined
      const undefinedUsers = filteredUsers.reduce((acc, user, index) => {
        if (user === undefined) {
          acc.push(users[index]);
        }
        return acc;
      }, [] as string[]);
      // remove duplicates
      const uniqueUndefinedUsers = [...new Set(undefinedUsers)];

      const usersData = await Core.NexusUserStreamService.read({ user_ids: uniqueUndefinedUsers });
      await this.persistUsers(usersData);
    } catch (error) {
      Logger.error('Failed to persist user stream', { error });
      throw error;
    }
  }
}
