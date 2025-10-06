import * as Core from '@/core';
import type { TCreatePostInput } from './post.types';

export class Post {
  static async create({
    postId,
    content,
    kind,
    authorId,
    postUrl,
    postJson,
    parentUri,
    attachments,
  }: TCreatePostInput) {
    await Core.Local.Post.save({ postId, content, kind, authorId, parentUri, attachments });
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, postUrl, postJson);
  }
}
