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
  static async upsert({ streamId, stream }: Core.TPostStreamUpsertParams): Promise<void> {
    await Core.PostStreamModel.upsert(streamId, stream);
  }

  static async bulkSave(postStreams: Core.TPostStreamUpsertParams[]): Promise<void> {
    await Promise.all(postStreams.map(({ streamId, stream }) => this.upsert({ streamId, stream })));
  }

  /**
   * Get a stream of post IDs by stream ID
   */
  static async findById(streamId: Core.PostStreamId): Promise<{ stream: string[] } | null> {
    return await Core.PostStreamModel.findById(streamId);
  }

  /**
   * Delete a stream from cache
   */
  static async deleteById(streamId: Core.PostStreamId): Promise<void> {
    await Core.PostStreamModel.deleteById(streamId);
  }

  /**
   * Adds a reply post to the post replies map if the post is a reply
   *
   * @param repliedUri - The URI of the parent post being replied to (optional)
   * @param replyPostId - The composite post ID of the reply post
   * @param postReplies - The map of reply stream IDs to arrays of reply post IDs
   */
  private static addReplyToStream(
    repliedUri: string | null | undefined,
    replyPostId: string,
    postReplies: Record<Core.ReplyStreamCompositeId, string[]>,
  ): void {
    if (!repliedUri) return;

    const parentCompositePostId = Core.buildCompositeIdFromPubkyUri({
      uri: repliedUri,
      domain: Core.CompositeIdDomain.POSTS,
    });
    if (!parentCompositePostId) return;

    const replyStreamId = Core.buildPostReplyStreamId(parentCompositePostId);
    postReplies[replyStreamId] = [...(postReplies[replyStreamId] || []), replyPostId];
  }

  static async persistPosts(posts: Core.NexusPost[]): Promise<Core.TPostStreamPersistResult> {
    const postCounts: Core.NexusModelTuple<Core.NexusPostCounts>[] = [];
    const postRelationships: Core.NexusModelTuple<Core.NexusPostRelationships>[] = [];
    const postTags: Core.NexusModelTuple<Core.NexusTag[]>[] = [];
    const postDetails: Core.RecordModelBase<string, Core.PostDetailsModelSchema>[] = [];

    const postReplies: Record<Core.ReplyStreamCompositeId, string[]> = {};
    const postAttachments: string[] = [];

    for (const post of posts) {
      // Build composite ID to ensure uniqueness (authorId:postId)
      const postId = Core.buildCompositeId({ pubky: post.details.author, id: post.details.id });

      postCounts.push([postId, post.counts]);

      postRelationships.push([postId, post.relationships]);
      if (post.details.attachments) {
        post.details.attachments.forEach((attachment) => {
          postAttachments.push(attachment);
        });
      }

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

      // Add reply to the post replies map if this post is a reply
      this.addReplyToStream(post.relationships.replied, postId, postReplies);
    }

    await Promise.all([
      Core.PostDetailsModel.bulkSave(postDetails),
      Core.PostCountsModel.bulkSave(postCounts),
      Core.PostTagsModel.bulkSave(postTags),
      Core.PostRelationshipsModel.bulkSave(postRelationships),
    ]);

    if (Object.keys(postReplies).length > 0) {
      await Promise.all(
        Object.entries(postReplies).map(async ([parentCompositePostId, postIds]) => {
          await this.upsert({
            streamId: parentCompositePostId as Core.PostStreamId,
            stream: postIds,
          });
        }),
      );
    }
    return { postAttachments };
  }

  /**
   * Extracts post IDs from Nexus post response
   * Temporary function until Nexus provides an endpoint that returns only IDs
   *
   * @param posts - Array of posts from Nexus API
   * @returns Array of composite post IDs (author:postId)
   */
  static async persistNewStreamChunk({ stream, streamId }: Core.TPostStreamUpsertParams) {
    const postStream = await Core.PostStreamModel.findById(streamId);

    if (!postStream) {
      // If stream doesn't exist (e.g., database was deleted), create it with the new chunk
      await Core.PostStreamModel.upsert(streamId, stream);
      return;
    }

    // Check for duplicates before adding
    const existingIds = new Set(postStream.stream);
    const newPostsToAdd = stream.filter((id) => !existingIds.has(id));

    // Combine existing and new posts
    const combinedStream = [...postStream.stream, ...newPostsToAdd];

    // Sort by timestamp (indexed_at) in descending order (most recent first)
    // Use bulk fetch to get all post details at once
    const posts = await Core.PostDetailsModel.findByIdsPreserveOrder(combinedStream);

    // Map post IDs with their timestamps
    const postTimestamps = combinedStream.map((postId, index) => ({
      postId,
      timestamp: posts[index]?.indexed_at || 0,
    }));

    const sortedStream = postTimestamps
      .sort((a, b) => b.timestamp - a.timestamp) // Descending order
      .map((item) => item.postId);

    await Core.PostStreamModel.upsert(streamId, sortedStream);
  }
}
