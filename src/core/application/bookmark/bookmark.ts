import * as Core from '@/core';

/**
 * Bookmark application service.
 *
 * **Parallel Write Pattern:**
 * Both `create` and `delete` methods update the local IndexedDB and homeserver
 * in parallel for optimal performance.
 *
 * **Failure Handling:**
 * If either operation fails, the entire operation fails. Callers should handle
 * errors and potentially retry or implement compensation logic.
 */
export class BookmarkApplication {
  static async create({ postId, bookmarkUrl, bookmarkJson }: Core.TCreateBookmarkInput) {
    // Get current user ID for user counts update
    const userId = Core.useAuthStore.getState().currentUserPubky;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Execute local and homeserver operations in parallel
    await Promise.all([
      Core.LocalBookmarkService.create({ userId, postId }),
      Core.HomeserverService.request(Core.HomeserverAction.PUT, bookmarkUrl, bookmarkJson),
    ]);
  }

  static async delete({ postId, bookmarkUrl }: Core.TDeleteBookmarkInput) {
    // Get current user ID for user counts update
    const userId = Core.useAuthStore.getState().currentUserPubky;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Execute local and homeserver operations in parallel
    await Promise.all([
      Core.LocalBookmarkService.delete({ userId, postId }),
      Core.HomeserverService.request(Core.HomeserverAction.DELETE, bookmarkUrl),
    ]);
  }
}
