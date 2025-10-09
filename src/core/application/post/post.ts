import * as Core from '@/core';
import type { TCreatePostInput, TDeletePostInput } from './post.types';

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

  static async delete({ postId, userId, postUrl, parentUri, repostedUri }: TDeletePostInput) {
    await Core.Local.Post.deletePost({ postId, userId, parentUri, repostedUri });
    await Core.HomeserverService.request(Core.HomeserverAction.DELETE, postUrl);
  }
}
