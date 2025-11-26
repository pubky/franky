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
    const localPost = await Core.LocalPostService.read({ postId });

    if (localPost) {
      return localPost;
    }

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
      return null;
    }

    // Persist all post data locally
    await Core.LocalPostService.persistPostData({ postId, postData });

    // Fetch and persist author if not in local DB
    await this.ensureAuthorExists(authorId as Core.Pubky);

    return postData.details;
  }

  /**
   * Ensures author exists in local DB, fetches from Nexus if not found
   * @param authorId - Author pubky
   */
  private static async ensureAuthorExists(authorId: Core.Pubky): Promise<void> {
    const localAuthor = await Core.UserDetailsModel.findById(authorId);

    if (localAuthor) {
      return;
    }

    try {
      const authorDetails = await Core.NexusUserService.details({ user_id: authorId });

      if (authorDetails) {
        await Core.UserDetailsModel.upsert(authorDetails);
      }
    } catch (error) {
      // Author fetch is not critical for post display, just log
      // The UI will show a placeholder for missing author data
      throw error; // Re-throw to let caller decide how to handle
    }
  }
}
