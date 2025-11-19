import * as Core from '@/core';

/**
 * Bookmark application service implementing local-first architecture.
 *
 * **Local-First Write Pattern:**
 * Both `create` and `delete` methods update the local IndexedDB first, then
 * synchronize with the homeserver. This ensures immediate UI responsiveness
 * but may cause divergence if the homeserver request fails.
 *
 * **Failure Handling:**
 * If the homeserver request fails after local update, the local state remains
 * ahead of remote state. Callers should:
 * - Implement retry logic for failed homeserver requests
 * - Add reconciliation mechanisms during app sync/bootstrap
 * - Consider compensation rollback on homeserver failure if strict consistency is required
 */
export class BookmarkApplication {
  static async create({ userId, postId, bookmarkUrl, bookmarkJson }: Core.TCreateBookmarkInput) {
    await Core.LocalBookmarkService.create({ userId, postId });
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, bookmarkUrl, bookmarkJson);
  }

  static async delete({ userId, postId, bookmarkUrl }: Core.TDeleteBookmarkInput) {
    await Core.LocalBookmarkService.delete({ userId, postId });
    await Core.HomeserverService.request(Core.HomeserverAction.DELETE, bookmarkUrl);
  }

  static async toggle({ userId, postId, bookmarkUrl, bookmarkJson }: Core.TCreateBookmarkInput): Promise<boolean> {
    const isBookmarked = await Core.LocalBookmarkService.exists(userId, postId);
    if (isBookmarked) {
      await this.delete({ userId, postId, bookmarkUrl });
      return false;
    } else {
      await this.create({ userId, postId, bookmarkUrl, bookmarkJson });
      return true;
    }
  }
}
