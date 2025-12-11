import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostApplication {
  static async create({ postUrl, compositePostId, post, fileAttachments, tags }: Core.TCreatePostInput): Promise<void> {
    if (fileAttachments && fileAttachments.length > 0) {
      await Core.FileApplication.upload({ fileAttachments });
    }
    await Core.LocalPostService.create({ compositePostId, post });
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, postUrl, post.toJson());

    if (tags && tags.length > 0) {
      await Core.TagApplication.create({ tagList: tags });
    }
  }

  static async delete({ compositePostId }: Core.TDeletePostParams): Promise<void> {
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
   * @param compositeId - Composite post ID in format "authorId:postId"
   * @returns Post details or null if not found
   */
  static async getOrFetchPost({
    compositeId,
    viewerId,
  }: Core.TCompositeId & { viewerId: Core.Pubky }): Promise<Core.PostDetailsModelSchema | null> {
    const localPost = await Core.LocalPostService.readPostDetails({ postId: compositeId });
    if (localPost) return localPost;

    // Reuse stream posts logic to fetch and persist single post
    await Core.PostStreamApplication.fetchMissingPostsFromNexus({
      cacheMissPostIds: [compositeId],
      viewerId,
    });

    // Return the persisted post details
    return await Core.LocalPostService.readPostDetails({ postId: compositeId });
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
