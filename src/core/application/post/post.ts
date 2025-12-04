import * as Core from '@/core';
import * as Libs from '@/libs';
import { BatchQueue } from '@/core/application/shared/BatchQueue';

/**
 * Batch queue for single post fetches.
 * Accumulates post IDs from multiple rapid calls and fetches them together.
 */
let postBatchQueue: BatchQueue<string, Core.PostDetailsModelSchema> | null = null;
let currentPostViewerId: Core.Pubky | undefined;

const getPostBatchQueue = (viewerId: Core.Pubky): BatchQueue<string, Core.PostDetailsModelSchema> => {
  currentPostViewerId = viewerId;

  if (!postBatchQueue) {
    postBatchQueue = new BatchQueue<string, Core.PostDetailsModelSchema>({
      name: 'PostBatch',
      delayMs: 100,
      executeBatch: async (compositeIds: string[]) => {
        // Reuse stream posts logic to fetch and persist posts
        await Core.PostStreamApplication.fetchMissingPostsFromNexus({
          cacheMissPostIds: compositeIds,
          viewerId: currentPostViewerId!,
        });
      },
      getResult: async (compositeId: string) => {
        return await Core.LocalPostService.readPostDetails({ postId: compositeId });
      },
    });
  }
  return postBatchQueue;
};

export class PostApplication {
  /**
   * Clears the batch queue state.
   * Exposed for testing purposes only.
   * @internal
   */
  static _clearBatchState(): void {
    postBatchQueue?.clear();
    postBatchQueue = null;
    currentPostViewerId = undefined;
  }
  static async create({ postUrl, compositePostId, post, fileAttachments, tags }: Core.TCreatePostInput) {
    if (fileAttachments && fileAttachments.length > 0) {
      await Core.FileApplication.upload({ fileAttachments });
    }
    await Core.LocalPostService.create({ compositePostId, post });
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, postUrl, post.toJson());

    if (tags && tags.length > 0) {
      await Core.TagApplication.create({ tagList: tags });
    }
  }

  static async delete({ compositePostId }: Core.TDeletePostParams) {
    const post = await Core.PostDetailsModel.findById(compositePostId);

    if (!post) {
      throw Libs.createSanitizationError(Libs.SanitizationErrorType.POST_NOT_FOUND, 'Post not found', 404, {
        compositePostId,
      });
    }
    const hadConnections = await Core.LocalPostService.delete({ compositePostId });

    // Always delete from homeserver, even if the post had connections (soft delete).
    // Nexus will determine the definitive state based on graph state.
    const postUrl = post.uri;
    await Core.HomeserverService.request(Core.HomeserverAction.DELETE, postUrl);

    if (!hadConnections && post.attachments && post.attachments.length > 0) {
      await Core.FileApplication.delete(post.attachments);
    }
  }

  /**
   * Get or fetch a post - reads from local DB first, fetches from Nexus if not found
   * Also fetches and persists related data: counts, relationships, tags, and author
   * Uses batching with debounce to combine rapid sequential requests into fewer API calls.
   * @param compositeId - Composite post ID in format "authorId:postId"
   * @returns Post details or null if not found
   */
  static async getOrFetchPost({
    compositeId,
    viewerId,
  }: Core.TCompositeId & { viewerId: Core.Pubky }): Promise<Core.PostDetailsModelSchema | null> {
    const localPost = await Core.LocalPostService.readPostDetails({ postId: compositeId });
    if (localPost) return localPost;

    // Queue for batch fetching
    const queue = getPostBatchQueue(viewerId);
    const result = await queue.enqueue(compositeId);
    return result ?? null;
  }

  /**
   * Get post counts for a specific post
   * @param compositeId - Composite post ID in format "authorId:postId"
   * @returns Post counts (with default values if not found)
   */
  static async getPostCounts({ compositeId }: Core.TCompositeId): Promise<Core.PostCountsModelSchema> {
    return await Core.LocalPostService.readPostCounts(compositeId);
  }

  /**
   * Get post tags for a specific post
   * @param compositeId - Composite post ID in format "authorId:postId"
   * @returns Post tags
   */
  static async getPostTags({ compositeId }: Core.TCompositeId): Promise<Core.TagCollectionModelSchema<string>[]> {
    return await Core.LocalPostService.readPostTags(compositeId);
  }

  /**
   * Get post relationships for a specific post
   * @param compositeId - Composite post ID in format "authorId:postId"
   * @returns Post relationships or null if not found
   */
  static async getPostRelationships({
    compositeId,
  }: Core.TCompositeId): Promise<Core.PostRelationshipsModelSchema | null> {
    return await Core.LocalPostService.readPostRelationships(compositeId);
  }

  /**
   * Get post details from local database
   * @param compositeId - Composite post ID in format "authorId:postId"
   * @returns Post details or null if not found
   */
  static async getPostDetails({ compositeId }: Core.TCompositeId): Promise<Core.PostDetailsModelSchema | null> {
    return await Core.LocalPostService.readPostDetails({ postId: compositeId });
  }
}
