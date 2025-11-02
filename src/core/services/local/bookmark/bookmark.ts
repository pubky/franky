import * as Core from '@/core';

export class LocalBookmarkService {
  static async create({ postUrl, bookmarkId }: { postUrl: string, bookmarkId: string}) {
    const postId = Core.buildPostIdFromPubkyUri(postUrl);
    await Core.BookmarkModel.upsert({
        id: postId,
        bookmark_id: bookmarkId,
        indexed_at: new Date().toISOString(),
    });
  }

  static async delete({ postUrl }: { postUrl: string}) {
    const postId = Core.buildPostIdFromPubkyUri(postUrl);
    await Core.BookmarkModel.deleteById(postId);
  }
}
