import * as Core from '@/core';
import { postUriBuilder } from 'pubky-app-specs';

export class BookmarkController {
  private constructor() {}

  /**
   * Create a bookmark
   * @param params - Parameters object
   * @param params.userId - ID of the user creating the bookmark
   * @param params.postId - Composite post ID (authorId:postId)
   */
  static async create(params: Core.TBookmarkEventParams) {
    const { bookmarkUrl, bookmarkJson } = await BookmarkController.generateBookmarkUri(params);
    const { userId, postId } = params;

    await Core.BookmarkApplication.create({
      userId,
      postId,
      bookmarkUrl,
      bookmarkJson,
    });
  }

  /**
   * Delete a bookmark
   * @param params - Parameters object
   * @param params.userId - ID of the user removing the bookmark
   * @param params.postId - Composite post ID (authorId:postId)
   */
  static async delete(params: Core.TBookmarkEventParams) {
    const { bookmarkUrl } = await BookmarkController.generateBookmarkUri(params);
    const { userId, postId } = params;

    await Core.BookmarkApplication.delete({
      userId,
      postId,
      bookmarkUrl,
    });
  }

  /**
   * Toggle a bookmark
   * @param params - Parameters object
   * @param params.userId - ID of the user toggling the bookmark
   * @param params.postId - Composite post ID (authorId:postId)
   * @returns boolean indicating new bookmark state (true = bookmarked, false = not bookmarked)
   */
  static async toggle(params: Core.TBookmarkEventParams): Promise<boolean> {
    const { bookmarkUrl, bookmarkJson } = await BookmarkController.generateBookmarkUri(params);
    const { userId, postId } = params;

    return await Core.BookmarkApplication.toggle({
      userId,
      postId,
      bookmarkUrl,
      bookmarkJson,
    });
  }

  private static async generateBookmarkUri({
    postId,
    userId,
  }: Core.TBookmarkEventParams): Promise<{ bookmarkUrl: string; bookmarkJson: Record<string, unknown> }> {
    // Parse composite post ID to get author and post ID
    const { pubky: authorId, id: rawPostId } = Core.parseCompositeId(postId);

    // Build the post URI
    const postUri = postUriBuilder(authorId, rawPostId);

    // Use BookmarkNormalizer to create bookmark with proper URI and ID
    const { bookmark, meta } = Core.BookmarkNormalizer.to(postUri, userId);

    return {
      bookmarkUrl: meta.url,
      bookmarkJson: bookmark.toJson(),
    };
  }
}
