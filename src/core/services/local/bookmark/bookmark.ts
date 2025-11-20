import * as Core from '@/core';
import * as Libs from '@/libs';

export class LocalBookmarkService {
  private static readonly BOOKMARK_TABLES = [
    Core.BookmarkModel.table,
    Core.UserCountsModel.table,
    Core.PostStreamModel.table,
    Core.PostDetailsModel.table,
  ] as const;

  /**
   * Creates a bookmark for a post and updates related data.
   *
   * - Creates bookmark record in database
   * - Increments user's bookmarks count
   * - Adds post to bookmark streams (timeline:bookmarks:all and type-specific streams)
   *
   * @param params.userId - ID of the user creating the bookmark (for user counts)
   * @param params.postId - Composite post ID (authorId:postId)
   *
   * @throws {DatabaseError} When database operations fail
   */
  static async create({ userId, postId }: Core.TBookmarkEventParams) {
    try {
      await Core.db.transaction('rw', this.BOOKMARK_TABLES, async () => {
        const existingBookmark = await Core.BookmarkModel.findById(postId);

        if (existingBookmark) {
          Libs.Logger.debug('Post already bookmarked', { postId });
          return;
        }

        const bookmark: Core.BookmarkModelSchema = {
          id: postId,
          created_at: Date.now(),
        };

        await Promise.all([
          Core.BookmarkModel.upsert(bookmark),
          Core.UserCountsModel.updateCounts(userId, { bookmarks: 1 }),
          this.addToBookmarkStreams(postId),
        ]);

        Libs.Logger.debug('Bookmark created', { postId });
      });
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.UPDATE_FAILED, `Failed to create bookmark`, 500, {
        error,
        postId,
      });
    }
  }

  /**
   * Removes a bookmark from a post and updates related data.
   *
   * - Removes bookmark record from database
   * - Decrements user's bookmarks count
   * - Removes post from bookmark streams
   *
   * @param params.userId - ID of the user removing the bookmark (for user counts)
   * @param params.postId - Composite post ID (authorId:postId)
   *
   * @throws {DatabaseError} When database operations fail
   */
  static async delete({ userId, postId }: Core.TBookmarkEventParams) {
    try {
      await Core.db.transaction('rw', this.BOOKMARK_TABLES, async () => {
        const existingBookmark = await Core.BookmarkModel.findById(postId);

        if (!existingBookmark) {
          Libs.Logger.debug('Post not bookmarked', { postId });
          return;
        }

        await Promise.all([
          Core.BookmarkModel.deleteById(postId),
          Core.UserCountsModel.updateCounts(userId, { bookmarks: -1 }),
          this.removeFromBookmarkStreams(postId),
        ]);

        Libs.Logger.debug('Bookmark deleted', { postId });
      });
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.UPDATE_FAILED, `Failed to delete bookmark`, 500, {
        error,
        postId,
      });
    }
  }

  /**
   * Checks if a post is bookmarked.
   *
   * @param postId - Composite post ID (authorId:postId)
   * @returns boolean indicating if the post is bookmarked
   */
  static async exists(postId: string): Promise<boolean> {
    const bookmark = await Core.BookmarkModel.findById(postId);
    return bookmark !== null;
  }

  /**
   * Get all bookmarked post IDs
   *
   * @returns Array of bookmarked post IDs
   */
  static async getAllBookmarks(): Promise<string[]> {
    const bookmarks = await Core.BookmarkModel.table.toArray();
    return bookmarks.map((b) => b.id);
  }

  /**
   * Add a post to the appropriate bookmark streams based on post type
   *
   * @param postId - Composite post ID
   */
  private static async addToBookmarkStreams(postId: string): Promise<void> {
    // Get post details to determine post type and content
    const postDetails = await Core.PostDetailsModel.findById(postId);
    if (!postDetails) {
      // If no post details, only add to main bookmarks stream
      await Core.LocalStreamPostsService.insertSortedByTimestamp(Core.PostStreamTypes.TIMELINE_BOOKMARKS_ALL, postId);
      return;
    }

    // Collect all applicable stream IDs
    const streamIds: Core.PostStreamTypes[] = [Core.PostStreamTypes.TIMELINE_BOOKMARKS_ALL];

    // Add to kind-based streams (short/long)
    if (postDetails.kind === 'short') {
      streamIds.push(Core.PostStreamTypes.TIMELINE_BOOKMARKS_SHORT);
    } else if (postDetails.kind === 'long') {
      streamIds.push(Core.PostStreamTypes.TIMELINE_BOOKMARKS_LONG);
    }

    if (!postDetails.attachments || postDetails.attachments.length === 0) {
      const urlRegex = /(https?:\/\/[^\s]+)/gi;
      const hasLinks = urlRegex.test(postDetails.content);

      if (hasLinks) {
        streamIds.push(Core.PostStreamTypes.TIMELINE_BOOKMARKS_LINK);
      }

      await Promise.all(
        streamIds.map((streamId) => Core.LocalStreamPostsService.insertSortedByTimestamp(streamId, postId)),
      );
      return;
    }

    const attachments = postDetails.attachments;

    const hasImages = attachments.some((uri) => {
      const lower = uri.toLowerCase();
      return (
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.webp') ||
        lower.endsWith('.gif')
      );
    });

    if (hasImages) {
      streamIds.push(Core.PostStreamTypes.TIMELINE_BOOKMARKS_IMAGE);
    }

    const hasVideos = attachments.some((uri) => {
      const lower = uri.toLowerCase();
      return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
    });

    if (hasVideos) {
      streamIds.push(Core.PostStreamTypes.TIMELINE_BOOKMARKS_VIDEO);
    }

    const hasFiles = attachments.some((uri) => {
      const lower = uri.toLowerCase();
      const isImage =
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.webp') ||
        lower.endsWith('.gif');
      const isVideo = lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
      return !isImage && !isVideo;
    });

    if (hasFiles) {
      streamIds.push(Core.PostStreamTypes.TIMELINE_BOOKMARKS_FILE);
    }

    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const hasLinks = urlRegex.test(postDetails.content);

    if (hasLinks) {
      streamIds.push(Core.PostStreamTypes.TIMELINE_BOOKMARKS_LINK);
    }

    await Promise.all(
      streamIds.map((streamId) => Core.LocalStreamPostsService.insertSortedByTimestamp(streamId, postId)),
    );
  }

  /**
   * Remove a post from all bookmark streams
   *
   * Note: We remove from all possible stream types without checking post details
   * for efficiency. The removeFromStream operation is idempotent.
   *
   * @param postId - Composite post ID
   */
  private static async removeFromBookmarkStreams(postId: string): Promise<void> {
    const streamTypes = [
      Core.PostStreamTypes.TIMELINE_BOOKMARKS_ALL,
      Core.PostStreamTypes.TIMELINE_BOOKMARKS_SHORT,
      Core.PostStreamTypes.TIMELINE_BOOKMARKS_LONG,
      Core.PostStreamTypes.TIMELINE_BOOKMARKS_IMAGE,
      Core.PostStreamTypes.TIMELINE_BOOKMARKS_VIDEO,
      Core.PostStreamTypes.TIMELINE_BOOKMARKS_LINK,
      Core.PostStreamTypes.TIMELINE_BOOKMARKS_FILE,
    ];

    // Remove from all bookmark stream types in parallel
    await Promise.all(streamTypes.map((streamId) => Core.LocalStreamPostsService.removeFromStream(streamId, postId)));
  }
}
