import * as Core from '@/core';
import { createSanitizationError, SanitizationErrorType } from '@/libs';

export class PostApplication {
  static async create({ postUrl, postId, authorId, post, fileAttachments, tags }: Core.TCreatePostInput) {
    if (fileAttachments) {
      await Core.FileApplication.upload({ fileAttachments });
    }
    await Core.LocalPostService.create({ postId, authorId, post });
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, postUrl, post.toJson());

    if (tags) {
      await Core.TagApplication.create({ tagList: tags });
    }
  }

  static async delete({ postId, deleterId }: Core.TDeletePostParams) {
    const post = await Core.PostDetailsModel.findById(postId);

    if (!post) {
      throw createSanitizationError(SanitizationErrorType.POST_NOT_FOUND, 'Post not found', 404, { postId });
    }
    const deletionExecuted = await Core.LocalPostService.delete({ postId, deleterId });

    if (deletionExecuted) {
      const postUrl = post.uri;
      await Core.HomeserverService.request(Core.HomeserverAction.DELETE, postUrl);

      if (post.attachments) {
        await Core.FileApplication.delete({ fileAttachments: post.attachments, postId });
      }
    }
  }
}
