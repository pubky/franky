import * as Core from '@/core';
import * as Application from '@/core/application';
import type { TCreateRepostParams, TDeleteRepostParams } from './repost.types';
import { createSanitizationError, SanitizationErrorType } from '@/libs';

export class RepostController {
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
   * Create a repost of an existing post
   * @param params - Parameters object
   * @param params.originalPostId - ID of the post being reposted
   * @param params.userId - ID of the user creating the repost
   * @param params.content - Optional content for quote repost (commentary)
   */
  static async create({ originalPostId, userId, content = '' }: TCreateRepostParams) {
    await this.initialize();

    const originalPost = await Core.PostDetailsModel.findById(originalPostId);
    if (!originalPost) {
      throw createSanitizationError(SanitizationErrorType.POST_NOT_FOUND, 'Original post not found', 404, {
        originalPostId,
      });
    }

    const normalizedPost = await Core.PostNormalizer.to(
      {
        content: content.trim(),
        kind: Core.PubkyAppPostKind.Short,
        embed: originalPost.uri,
      },
      userId,
    );

    const postId = `${userId}:${normalizedPost.meta.id}`;

    await Application.Repost.create({
      postUrl: normalizedPost.meta.url,
      postJson: normalizedPost.post.toJson(),
      postId,
      content: normalizedPost.post.content,
      authorId: userId,
      repostedUri: originalPost.uri,
      attachments: normalizedPost.post.attachments ?? undefined,
    });
  }

  /**
   * Delete a repost
   * @param params - Parameters object
   * @param params.repostId - ID of the repost to delete
   * @param params.userId - ID of the user deleting the repost
   */
  static async delete({ repostId, userId }: TDeleteRepostParams) {
    await this.initialize();

    const repost = await Core.PostDetailsModel.findById(repostId);
    if (!repost) {
      throw createSanitizationError(SanitizationErrorType.POST_NOT_FOUND, 'Repost not found', 404, { repostId });
    }

    const repostRelationships = await Core.PostRelationshipsModel.findById(repostId);
    if (!repostRelationships?.reposted) {
      throw createSanitizationError(SanitizationErrorType.POST_NOT_FOUND, 'Post is not a repost', 400, { repostId });
    }

    const author = repostId.split(':')[0];
    if (author !== userId) {
      throw createSanitizationError(
        SanitizationErrorType.POST_NOT_FOUND,
        'User is not the author of this repost',
        403,
        {
          repostId,
          userId,
        },
      );
    }

    await Application.Repost.delete({
      repostId,
      userId,
      repostedUri: repostRelationships.reposted,
      repostUrl: repost.uri,
    });
  }
}
