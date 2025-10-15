import * as Core from '@/core';
import { createSanitizationError, SanitizationErrorType } from '@/libs';

export class PostApplication {
  static async create({ postUrl, postId, authorId, post }: Core.TCreatePostInput) {
    await Core.LocalPostService.create({ postId, authorId, post });
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, postUrl, post.toJson());
  }

  static async delete({ postId, deleterId }: Core.TDeletePostParams) {
    const post = await Core.PostDetailsModel.findById(postId);

    if (!post) {
      throw createSanitizationError(SanitizationErrorType.POST_NOT_FOUND, 'Post not found', 404, { postId });
    }
    await Core.LocalPostService.delete({ postId, deleterId });

    const postUrl = post.uri;
    await Core.HomeserverService.request(Core.HomeserverAction.DELETE, postUrl);
  }
}
