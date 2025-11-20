import * as Core from '@/core';
import { postUriBuilder } from 'pubky-app-specs';

export class BookmarkController {
  private constructor() {}

  /**
   * Create a bookmark
   * @param params - Parameters object
   * @param params.userId - ID of the user creating the bookmark (current user)
   * @param params.postId - Composite post ID (authorId:postId)
   */
  static async create(params: Core.TBookmarkEventParams) {
    const { bookmarkUrl, bookmarkJson } = await BookmarkController.generateBookmarkUri(params);
    const { postId } = params;

    await Core.BookmarkApplication.create({
      postId,
      bookmarkUrl,
      bookmarkJson,
    });
  }

  /**
   * Delete a bookmark
   * @param params - Parameters object
   * @param params.userId - ID of the user removing the bookmark (current user)
   * @param params.postId - Composite post ID (authorId:postId)
   */
  static async delete(params: Core.TBookmarkEventParams) {
    const { bookmarkUrl } = await BookmarkController.generateBookmarkUri(params);
    const { postId } = params;

    await Core.BookmarkApplication.delete({
      postId,
      bookmarkUrl,
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
