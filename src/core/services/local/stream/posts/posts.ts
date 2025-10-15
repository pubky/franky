import * as Core from '@/core';
import * as Libs from '@/libs';

export class LocalStreamPostsService {
  private constructor() {}

  /**
   * Fetches posts from Nexus, persists them locally, and updates the cache
   *
   * @param streamId - The type of stream to fetch
   * @param fetchOffset - Offset for pagination in the Nexus API
   * @param existingStream - Current cached stream IDs to merge with new ones
   * @returns Updated stream array or null if no posts found
   */
  static async fetchAndCachePosts(
    streamId: Core.PostStreamTypes,
    fetchOffset: number,
    existingStream: string[] = [],
  ): Promise<string[] | null> {
    try {
      // Fetch from Nexus API
      const nexusPosts = await Core.NexusPostStreamService.read({
        streamId,
        limit: 100,
        offset: fetchOffset,
      });

      if (!nexusPosts || nexusPosts.length === 0) {
        return null;
      }

      // Persist to local database
      const users = nexusPosts.map((post) => post.details.author);
      await Core.LocalStreamUsersService.persistUserStream(users);
      await Core.LocalStreamPostsService.persistPosts(nexusPosts);

      // Extract composite IDs
      const postIds = nexusPosts.map((post) =>
        Core.buildPostCompositeId({ pubky: post.details.author, postId: post.details.id }),
      );

      // Merge with existing stream and update cache
      const updatedStream = [...existingStream, ...postIds];
      await Core.PostStreamModel.upsert(streamId, updatedStream);

      Libs.Logger.debug('Stream cache updated', {
        streamId,
        newPosts: postIds.length,
        totalCached: updatedStream.length,
      });

      return updatedStream;
    } catch (error) {
      Libs.Logger.error('Failed to fetch and cache posts', { streamId, fetchOffset, error });
      throw error;
    }
  }

  /**
   * Validates cache integrity by checking for duplicate IDs
   *
   * @param cachedStream - Stream to validate
   * @returns true if cache is valid (no duplicates), false otherwise
   */
  static validateCacheIntegrity(cachedStream: { stream: string[] }): boolean {
    if (!cachedStream || !cachedStream.stream || cachedStream.stream.length === 0) {
      return true;
    }

    const uniqueIds = new Set(cachedStream.stream);
    const hasDuplicates = uniqueIds.size !== cachedStream.stream.length;

    if (hasDuplicates) {
      Libs.Logger.warn('Cache integrity check failed: duplicates detected', {
        totalIds: cachedStream.stream.length,
        uniqueIds: uniqueIds.size,
      });
    }

    return !hasDuplicates;
  }

  /**
   * Clears corrupted cache for a given stream
   *
   * @param streamId - Stream ID to clear
   */
  static async clearCorruptedCache(streamId: Core.PostStreamTypes): Promise<void> {
    try {
      await Core.PostStreamModel.deleteById(streamId);
      Libs.Logger.info('Corrupted cache cleared', { streamId });
    } catch (error) {
      Libs.Logger.error('Failed to clear corrupted cache', { streamId, error });
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

      Libs.Logger.debug('Posts persisted successfully', { count: posts.length });
    } catch (error) {
      Libs.Logger.error('Failed to persist posts', { error, count: posts.length });
      throw error;
    }
  }
}
