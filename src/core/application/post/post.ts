import * as Core from '@/core';
import type { TCreatePostInput } from './post.types';
import { createSanitizationError, SanitizationErrorType } from '@/libs';

export class Post {
  static async create({
    postUrl,
    postJson,
    postId,
    content,
    kind,
    authorId,
    parentUri,
    attachments,
    repostedUri,
  }: TCreatePostInput) {
    await Core.Local.Post.create({ postId, content, kind, authorId, parentUri, attachments, repostedUri });
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, postUrl, postJson);
  }

  static async delete({ postId, deleterId }: Core.TDeletePostParams) {
    const post = await Core.PostDetailsModel.findById(postId);

    if (!post) {
      throw createSanitizationError(SanitizationErrorType.POST_NOT_FOUND, 'Post not found', 404, { postId });
    }
    await Core.Local.Post.delete({ postId, deleterId });

    const postUrl = post.uri;
    await Core.HomeserverService.request(Core.HomeserverAction.DELETE, postUrl);
  }
}
