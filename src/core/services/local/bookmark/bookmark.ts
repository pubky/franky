import * as Core from '@/core';
import * as Libs from '@/libs';
import { BookmarkResult } from 'pubky-app-specs';

export class LocalBookmarkService {
  static async create({ meta, bookmark }: BookmarkResult) {
    try {
      const postId = Core.buildPostIdFromPubkyUri(bookmark.uri);
      const authorPubky = meta.url.split('/')[2];
      await Core.db.transaction('rw', [Core.UserCountsModel.table, Core.BookmarkModel.table], async () => {
        const existed = await Core.BookmarkModel.exists(postId);
        await Core.BookmarkModel.upsert({
          id: postId,
          bookmark_id: meta.id,
          indexed_at: new Date().toISOString(),
        });
        if (!existed) {
          await Core.UserCountsModel.updateCounts(authorPubky, { bookmarks: 1 });
        }
        // TODO: Wait if we include the bookmarks to streams
      });
      Libs.Logger.debug('Bookmark created successfully', { authorPubky, bookmarkId: meta.id });
    } catch (error) {
      Libs.Logger.error('Failed to bookmark', { bookmarkUri: meta.url, error });
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.SAVE_FAILED, 'Failed to create bookmark', 500, {
        error,
      });
    }
  }

  static async delete({ postUrl, authorPubky }: Core.TDeleteBookmarkParams) {
    try {
      const postId = Core.buildPostIdFromPubkyUri(postUrl);
      if (!postId) {
        throw Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, 'PostId could not be generated', 404, {
          postUrl,
        });
      }
      await Core.db.transaction('rw', [Core.BookmarkModel.table, Core.UserCountsModel.table], async () => {
        // Ensure counts are decremented only when a bookmark actually existed.
        const existed = await Core.BookmarkModel.exists(postId);
        await Core.BookmarkModel.deleteById(postId);
        if (existed) {
          await Core.UserCountsModel.updateCounts(authorPubky, { bookmarks: -1 });
        }
        // TODO: Wait if we include the bookmarks to streams
      });
      Libs.Logger.debug('Bookmark deleted successfully', { postId });
    } catch (error) {
      Libs.Logger.error('Failed to delete bookmark', { postUrl, error });
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.DELETE_FAILED, 'Failed to delete bookmark', 500, {
        error,
      });
    }
  }
}
