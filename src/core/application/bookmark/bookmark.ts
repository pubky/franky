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
  static async persist(
    action: Core.HomeserverAction,
    params: { postId: string; bookmarkUrl: string; bookmarkJson?: Record<string, unknown> },
  ) {
    // Get current user ID for user counts update
    const userId = Core.useAuthStore.getState().selectCurrentUserPubky();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { postId, bookmarkUrl, bookmarkJson } = params;

    // Execute local and homeserver operations in parallel
    await Promise.all([
      Core.LocalBookmarkService.persist(action, { userId, postId }),
      Core.HomeserverService.request(action, bookmarkUrl, bookmarkJson),
    ]);
  }
}
