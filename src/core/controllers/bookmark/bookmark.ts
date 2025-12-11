import * as Core from '@/core';
import { postUriBuilder } from 'pubky-app-specs';

export class BookmarkController {
  private constructor() {}

  /**
   * Check if a post is bookmarked
   * @param postId - Composite post ID (authorId:postId)
   * @returns boolean indicating if the post is bookmarked
   */
  static async exists(postId: string): Promise<boolean> {
    return Core.BookmarkApplication.exists(postId);
  }

  /**
   * Create a bookmark
   * @param params - Parameters object
   * @param params.userId - ID of the user creating the bookmark (current user)
   * @param params.postId - Composite post ID (authorId:postId)
   */
  static async create({ postId, userId }: Core.TBookmarkEventParams): Promise<void> {
    const { pubky: authorId, id: rawPostId } = Core.parseCompositeId(postId);
    const postUri = postUriBuilder(authorId, rawPostId);
    const { bookmark, meta } = Core.BookmarkNormalizer.to(postUri, userId);

    await Core.BookmarkApplication.persist(Core.HomeserverAction.PUT, {
      postId,
      bookmarkUrl: meta.url,
      bookmarkJson: bookmark.toJson(),
    });
  }

  /**
   * Delete a bookmark
   * @param params - Parameters object
   * @param params.userId - ID of the user removing the bookmark (current user)
   * @param params.postId - Composite post ID (authorId:postId)
   */
  static async delete({ postId, userId }: Core.TBookmarkEventParams): Promise<void> {
    const { pubky: authorId, id: rawPostId } = Core.parseCompositeId(postId);
    const postUri = postUriBuilder(authorId, rawPostId);
    const { meta } = Core.BookmarkNormalizer.to(postUri, userId);

    await Core.BookmarkApplication.persist(Core.HomeserverAction.DELETE, {
      postId,
      bookmarkUrl: meta.url,
    });
  }
}
