import * as Core from '@/core';
import { createSanitizationError, SanitizationErrorType } from '@/libs';

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
      throw createSanitizationError(SanitizationErrorType.POST_NOT_FOUND, 'Post not found', 404, { compositePostId });
    }
    const hadConnections = await Core.LocalPostService.delete({ compositePostId });

    if (!hadConnections) {
      const postUrl = post.uri;
      await Core.HomeserverService.request(Core.HomeserverAction.DELETE, postUrl);

      if (post.attachments && post.attachments.length > 0) {
        await Core.FileApplication.delete(post.attachments);
      }
    }
  }
}
