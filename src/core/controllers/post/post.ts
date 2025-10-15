import * as Core from '@/core';
import * as Application from '@/core/application';
import type { TCreatePostParams, TReadPostsParams, TDeletePostParams } from './post.types';
import { createSanitizationError, SanitizationErrorType } from '@/libs';
import { PostValidators } from '@/core/pipes/post/post.validators';

export class PostController {
  private static isInitialized = false;

  private constructor() {}

  /**
   * Initialize the controller
   */
  private static async initialize() {
    if (!this.isInitialized) {
      await Core.db.initialize();
      this.isInitialized = true;
    }
  }

  /**
   * Read posts with optional pagination
   * @param params - Parameters object
   * @param params.limit - Number of posts to fetch (default: 30)
   * @param params.offset - Number of posts to skip (default: 0)
   * @returns Array of NexusPost objects
   */
  static async read({ limit = 30, offset = 0 }: TReadPostsParams = {}): Promise<Core.NexusPost[]> {
    await this.initialize();
    return Core.Local.Post.fetch({ limit, offset });
  }

  /**
   * Create a post (including replies and reposts)
   * @param params - Parameters object
   * @param params.parentPostId - ID of the post being replied to (optional for root posts)
   * @param params.originalPostId - ID of the post being reposted (optional for reposts)
   * @param params.content - Post content (can be empty for simple reposts)
   * @param params.kind - Post kind (default: Short, automatically set to repost in storage if originalPostId is provided)
   * @param params.authorId - ID of the user creating the post
   */
  static async create({
    parentPostId,
    originalPostId,
    content,
    kind = Core.PubkyAppPostKind.Short,
    authorId,
  }: TCreatePostParams) {
    await this.initialize();

    let parentUri: string | undefined = undefined;
    let repostedUri: string | undefined = undefined;

    // Validate and set parent URI if this is a reply
    if (parentPostId) {
      parentUri = await PostValidators.validatePostId({ postId: parentPostId, message: 'Parent post' });
    }

    // Validate and set reposted URI if this is a repost
    if (originalPostId) {
      repostedUri = await PostValidators.validatePostId({ postId: originalPostId, message: 'Original post' });
    }

    const { post, meta } = await Core.PostNormalizer.to(
      {
        content: content.trim(),
        kind,
        parentUri,
        embed: repostedUri,
      },
      authorId,
    );

    await Application.Post.create({
      postId: meta.id,
      authorId,
      post,
      postUrl: meta.url,
    });
  }

  /**
   * Delete a post
   * @param params - Parameters object
   * @param params.postId - ID of the post to delete
   * @param params.deleterId - ID of the user deleting the post
   */
  static async delete({ postId, deleterId }: TDeletePostParams) {
    await this.initialize();

    const { pubky: authorId } = Core.parsePostCompositeId(postId);

    if (authorId !== deleterId) {
      throw createSanitizationError(SanitizationErrorType.POST_NOT_FOUND, 'User is not the author of this post', 403, {
        postId,
        deleterId,
      });
    }

    await Application.Post.delete({ postId, deleterId });
  }
}
