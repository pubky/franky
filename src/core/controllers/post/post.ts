import * as Core from '@/core';
import * as Application from '@/core/application';
import type { TCreatePostParams } from './post.types';
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
}
