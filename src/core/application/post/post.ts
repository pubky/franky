import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostApplication {
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
   * @param postId - ID of the post to get (format: "authorId:postId")
   * @returns Post details or null if not found
   */
  static async getOrFetchPost(postId: string): Promise<Core.PostDetailsModelSchema | null> {
    // Try to read from local database first
    const localPost = await Core.LocalPostService.readPostDetails({ postId });

    if (localPost) {
      Libs.Logger.debug(`[PostApplication] Post found in local DB: ${postId}`);
      return localPost;
    }

    Libs.Logger.debug(`[PostApplication] Post NOT found locally, fetching from Nexus: ${postId}`);

    // If not found locally, fetch from Nexus
    const [authorId, pId] = postId.split(':');

    if (!authorId || !pId) {
      throw Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, `Invalid postId format: ${postId}`, 400, {
        postId,
      });
    }

    // Fetch complete post data from Nexus
    const postData = await Core.NexusPostStreamService.getPost({
      authorId: authorId as Core.Pubky,
      postId: pId,
    });

    if (!postData) {
      Libs.Logger.warn(`[PostApplication] Post not found in Nexus: ${postId}`);
      return null;
    }

    Libs.Logger.debug(`[PostApplication] Post fetched from Nexus, persisting locally: ${postId}`);

    // Persist all post data locally
    await Core.LocalPostService.persistPostData({ postId, postData });

    Libs.Logger.debug(`[PostApplication] Post persisted, ensuring author exists: ${authorId}`);

    // Fetch and persist author if not in local DB
    await this.ensureAuthorExists(authorId as Core.Pubky);

    Libs.Logger.debug(`[PostApplication] getOrFetchPost completed successfully: ${postId}`);

    return postData.details;
  }

  /**
   * Get post counts for a specific post
   * @param postId - Composite post ID (author:postId)
   * @returns Post counts (with default values if not found)
   */
  static async getPostCounts(postId: string): Promise<Core.PostCountsModelSchema> {
    return await Core.LocalPostService.readPostCounts(postId);
  }

  /**
   * Get post tags for a specific post
   * @param postId - Composite post ID (author:postId)
   * @returns Post tags
   */
  static async getPostTags(postId: string): Promise<Core.TagCollectionModelSchema<string>[]> {
    return await Core.LocalPostService.readPostTags(postId);
  }

  /**
   * Get post relationships for a specific post
   * @param postId - Composite post ID (author:postId)
   * @returns Post relationships or null if not found
   */
  static async getPostRelationships(postId: string): Promise<Core.PostRelationshipsModelSchema | null> {
    return await Core.LocalPostService.readPostRelationships(postId);
  }

  /**
   * Get post details from local database
   * @param postId - Composite post ID (author:postId)
   * @returns Post details or null if not found
   */
  static async getPostDetails(postId: string): Promise<Core.PostDetailsModelSchema | null> {
    return await Core.LocalPostService.readPostDetails({ postId });
  }

  /**
   * Ensures author exists in local DB, fetches from Nexus if not found
   * @param authorId - Author pubky
   */
  private static async ensureAuthorExists(authorId: Core.Pubky): Promise<void> {
    const localAuthor = await Core.UserDetailsModel.findById(authorId);

    if (localAuthor) {
      Libs.Logger.debug(`[PostApplication] Author already exists in DB: ${authorId}`);
      return;
    }

    Libs.Logger.debug(`[PostApplication] Author NOT found, fetching from Nexus: ${authorId}`);

    try {
      const authorDetails = await Core.NexusUserService.details({ user_id: authorId });

      if (authorDetails) {
        Libs.Logger.debug(`[PostApplication] Author fetched, upserting:`, authorDetails);
        await Core.UserDetailsModel.upsert(authorDetails);
        Libs.Logger.debug(`[PostApplication] Author upserted successfully: ${authorId}`);
      } else {
        Libs.Logger.warn(`[PostApplication] Author details not found in Nexus: ${authorId}`);
      }
    } catch (error) {
      // Author fetch is not critical for post display, just log
      Libs.Logger.error(`[PostApplication] Failed to fetch author: ${authorId}`, error);
      // The UI will show a placeholder for missing author data
      throw error; // Re-throw to let caller decide how to handle
    }
  }
}
