import * as Core from '@/core';

/**
 * Local Stream Posts Service
 *
 * Simple service to manage post stream IDs in IndexDB.
 * Only stores arrays of post IDs, no post data or user data.
 */
export class LocalStreamPostsService {
  private constructor() {}

  /**
   * Save or update a stream of post IDs
   */
  static async upsert(streamId: Core.PostStreamTypes, stream: string[]): Promise<void> {
    await Core.PostStreamModel.upsert(streamId, stream);
  }

  /**
   * Get a stream of post IDs by stream ID
   */
  static async findById(streamId: Core.PostStreamTypes): Promise<{ stream: string[] } | null> {
    return await Core.PostStreamModel.findById(streamId);
  }

  /**
   * Delete a stream from cache
   */
  static async deleteById(streamId: Core.PostStreamTypes): Promise<void> {
    await Core.PostStreamModel.deleteById(streamId);
  }

  static async persistPosts(posts: Core.NexusPost[]): Promise<string[]> {
    const postCounts: Core.NexusModelTuple<Core.NexusPostCounts>[] = [];
    const postRelationships: Core.NexusModelTuple<Core.NexusPostRelationships>[] = [];
    const postTags: Core.NexusModelTuple<Core.NexusTag[]>[] = [];
    const postDetails: Core.RecordModelBase<string, Core.PostDetailsModelSchema>[] = [];

    const compositePostIds: string[] = [];

    for (const post of posts) {
      // Build composite ID to ensure uniqueness (authorId:postId)
      const postId = Core.buildPostCompositeId({ pubky: post.details.author, postId: post.details.id });
      compositePostIds.push(postId);
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
    return compositePostIds;
  }

  /**
   * Extracts post IDs from Nexus post response
   * Temporary function until Nexus provides an endpoint that returns only IDs
   *
   * @param posts - Array of posts from Nexus API
   * @returns Array of composite post IDs (author:postId)
   */
  static async persistNewStreamChunk(posts: string[], streamId: Core.PostStreamTypes) {
    const postStream = await Core.PostStreamModel.findById(streamId);
    if (!postStream) {
      throw new Error(`Post stream not found: ${streamId}`);
    }
    await Core.PostStreamModel.upsert(streamId, [ ...postStream.stream, ...posts ]);
  }
}
