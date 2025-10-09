import * as Core from '@/core';
import type { TCreateRepostInput, TDeleteRepostInput } from './repost.types';

export class Repost {
  static async create({ postUrl, postJson, postId, content, authorId, repostedUri, attachments }: TCreateRepostInput) {
    await Core.Local.Post.create({
      postId,
      content,
      kind: 'repost',
      authorId,
      repostedUri,
      attachments,
    });
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, postUrl, postJson);
  }

  static async delete({ repostId, userId, repostedUri, repostUrl }: TDeleteRepostInput) {
    await Core.Local.Post.deleteRepost({ repostId, userId, repostedUri });
    await Core.HomeserverService.request(Core.HomeserverAction.DELETE, repostUrl);
  }
}
