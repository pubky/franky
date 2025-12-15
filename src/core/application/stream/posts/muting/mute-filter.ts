import * as Core from '@/core';

/**
 * Handles mute filtering for post streams.
 *
 * This class provides static utility methods for filtering posts based on muted users.
 * It does not directly access the Service layer - muted user IDs should be retrieved
 * at the Application layer and passed as parameters.
 */
export class MuteFilter {
  private constructor() {}

  /**
   * Filters out posts authored by muted users.
   *
   * @param postIds - Array of composite post IDs to filter
   * @param mutedUserIds - Set of muted user IDs (pubkeys)
   * @returns Filtered array of post IDs excluding posts from muted users
   */
  static filterPosts(postIds: string[], mutedUserIds: Set<Core.Pubky>): string[] {
    if (mutedUserIds.size === 0) {
      return postIds;
    }
    return postIds.filter((postId) => {
      const { pubky: authorId } = Core.parseCompositeId(postId);
      return !mutedUserIds.has(authorId);
    });
  }
}
