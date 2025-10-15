import * as Core from '@/core';

export class PostApplication {
  static async create({
    postUrl,
    postJson,
    postId,
    content,
    kind,
    authorId,
    parentUri,
    attachments,
  }: Core.TCreatePostInput) {
    await Core.LocalPostService.create({ postId, content, kind, authorId, parentUri, attachments });
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, postUrl, postJson);
  }
}
