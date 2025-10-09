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
   * Create a post (including replies)
   * @param params - Parameters object
   * @param params.parentPostId - ID of the post being replied to (optional for root posts)
   * @param params.content - Post content
   * @param params.authorId - ID of the user creating the post
   */
  static async create({ parentPostId, content, authorId }: TCreatePostParams) {
    await this.initialize();

    let parentUri: string | undefined = undefined;
    if (parentPostId) {
      const parentPost = await Core.PostDetailsModel.findById(parentPostId);
      if (!parentPost) {
        throw createSanitizationError(SanitizationErrorType.POST_NOT_FOUND, 'Failed to validate parent post', 404, {
          parentPostId,
        });
      }
      parentUri = parentPost.uri;
    }

    const normalizedPost = await Core.PostNormalizer.to(
      {
        content: content.trim(),
        kind: Core.PubkyAppPostKind.Short,
        parentUri,
      },
      authorId,
    );

    const postId = Core.buildPostCompositeId({ pubky: authorId, postId: normalizedPost.meta.id });

    await Application.Post.create({
      postUrl: normalizedPost.meta.url,
      postJson: normalizedPost.post.toJson(),
      postId,
      content: normalizedPost.post.content,
      kind: Core.normalizePostKind(normalizedPost.post.kind) as Core.NexusPostKind,
      authorId,
      parentUri,
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
