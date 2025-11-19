import * as Core from '@/core';
import * as Libs from '@/libs';

export class LocalBookmarkService {
  private static readonly BOOKMARK_TABLES = [Core.BookmarkModel.table, Core.UserCountsModel.table] as const;

  /**
   * Creates a bookmark for a post and updates user counts.
   *
   * - Creates bookmark record in database
   * - Increments user's bookmarks count
   *
   * @param params.userId - ID of the user creating the bookmark
   * @param params.postId - Composite post ID (authorId:postId)
   *
   * @throws {DatabaseError} When database operations fail
   */
  static async create({ userId, postId }: Core.TLocalBookmarkParams) {
    try {
      await Core.db.transaction('rw', this.BOOKMARK_TABLES, async () => {
        const bookmarkId = `${userId}:${postId}`;
        const existingBookmark = await Core.BookmarkModel.findById(bookmarkId);

        if (existingBookmark) {
          Libs.Logger.debug('Post already bookmarked by this user', { postId, userId });
          return;
        }

        const bookmark: Core.BookmarkModelSchema = {
          id: bookmarkId,
          userId,
          postId,
          created_at: Date.now(),
          updated_at: Date.now(),
        };

        await Core.BookmarkModel.upsert(bookmark);
        await Core.UserCountsModel.updateCounts(userId, { bookmarks: 1 });

        Libs.Logger.debug('Bookmark created', { postId, userId });
      });
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.CREATE_FAILED, `Failed to create bookmark`, 500, {
        error,
        postId,
        userId,
      });
    }
  }

  /**
   * Removes a bookmark from a post and updates user counts.
   *
   * - Removes bookmark record from database
   * - Decrements user's bookmarks count
   *
   * @param params.userId - ID of the user removing the bookmark
   * @param params.postId - Composite post ID (authorId:postId)
   *
   * @throws {DatabaseError} When database operations fail
   */
  static async delete({ userId, postId }: Core.TLocalBookmarkParams) {
    try {
      await Core.db.transaction('rw', this.BOOKMARK_TABLES, async () => {
        const bookmarkId = `${userId}:${postId}`;
        const existingBookmark = await Core.BookmarkModel.findById(bookmarkId);

        if (!existingBookmark) {
          Libs.Logger.debug('Post not bookmarked by this user', { postId, userId });
          return;
        }

        await Core.BookmarkModel.deleteById(bookmarkId);
        await Core.UserCountsModel.updateCounts(userId, { bookmarks: -1 });

        Libs.Logger.debug('Bookmark deleted', { postId, userId });
      });
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.DELETE_FAILED, `Failed to delete bookmark`, 500, {
        error,
        postId,
        userId,
      });
    }
  }

  /**
   * Checks if a post is bookmarked by a user.
   *
   * @param userId - User ID
   * @param postId - Composite post ID (authorId:postId)
   * @returns boolean indicating if the post is bookmarked
   */
  static async exists(userId: Core.Pubky, postId: string): Promise<boolean> {
    return await Core.BookmarkModel.existsByUserAndPost(userId, postId);
  }

  /**
   * Toggles a bookmark for a post.
   * If bookmarked, removes it. If not bookmarked, creates it.
   *
   * @param params.userId - ID of the user toggling the bookmark
   * @param params.postId - Composite post ID (authorId:postId)
   * @returns boolean indicating new bookmark state (true = bookmarked, false = not bookmarked)
   */
  static async toggle(params: Core.TLocalBookmarkParams): Promise<boolean> {
    const isBookmarked = await this.exists(params.userId, params.postId);
    if (isBookmarked) {
      await this.delete(params);
      return false;
    } else {
      await this.create(params);
      return true;
    }
  }

  /**
   * Get all bookmarks for a user
   *
   * @param userId - User ID
   * @returns Array of bookmarked post IDs
   */
  static async getBookmarksByUser(userId: Core.Pubky): Promise<string[]> {
    const bookmarks = await Core.BookmarkModel.findByUserId(userId);
    return bookmarks.map((b) => b.postId);
  }
}
