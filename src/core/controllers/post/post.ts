import * as Core from '@/core';
import * as Application from '@/core/application';
import type { TCreatePostParams, TReadPostsParams, TDeleteParams } from './post.types';
import { createSanitizationError, SanitizationErrorType } from '@/libs';

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
    let postKind: Core.NexusPostKind;

    // Validate and set parent URI if this is a reply
    if (parentPostId) {
      const parentPost = await Core.PostDetailsModel.findById(parentPostId);
      if (!parentPost) {
        throw createSanitizationError(SanitizationErrorType.POST_NOT_FOUND, 'Failed to validate parent post', 404, {
          parentPostId,
        });
      }
      parentUri = parentPost.uri;
    }

    // Validate and set reposted URI if this is a repost
    if (originalPostId) {
      const originalPost = await Core.PostDetailsModel.findById(originalPostId);
      if (!originalPost) {
        throw createSanitizationError(SanitizationErrorType.POST_NOT_FOUND, 'Original post not found', 404, {
          originalPostId,
        });
      }
      repostedUri = originalPost.uri;
    }

    const normalizedPost = await Core.PostNormalizer.to(
      {
        content: content.trim(),
        kind,
        parentUri,
        embed: repostedUri,
      },
      authorId,
    );

    const postId = Core.buildPostCompositeId({ pubky: authorId, postId: normalizedPost.meta.id });

    if (originalPostId) {
      postKind = 'repost';
    } else {
      postKind = Core.normalizePostKind(normalizedPost.post.kind) as Core.NexusPostKind;
    }

    await Application.Post.create({
      postUrl: normalizedPost.meta.url,
      postJson: normalizedPost.post.toJson(),
      postId,
      content: normalizedPost.post.content,
      kind: postKind,
      authorId,
      parentUri,
      repostedUri,
      attachments: normalizedPost.post.attachments ?? undefined,
    });
  }

  /**
   * Delete a post
   * @param params - Parameters object
   * @param params.postId - ID of the post to delete
   * @param params.userId - ID of the user deleting the post
   */
  static async delete({ postId, userId }: TDeleteParams) {
    await this.initialize();

    const post = await Core.PostDetailsModel.findById(postId);
    if (!post) {
      throw createSanitizationError(SanitizationErrorType.POST_NOT_FOUND, 'Post not found', 404, { postId });
    }

    const author = postId.split(':')[0];
    if (author !== userId) {
      throw createSanitizationError(SanitizationErrorType.POST_NOT_FOUND, 'User is not the author of this post', 403, {
        postId,
        userId,
      });
    }

    const postRelationships = await Core.PostRelationshipsModel.findById(postId);

    await Application.Post.delete({
      postId,
      userId,
      postUrl: post.uri,
      parentUri: postRelationships?.replied ?? undefined,
      repostedUri: postRelationships?.reposted ?? undefined,
    });
  }
}
