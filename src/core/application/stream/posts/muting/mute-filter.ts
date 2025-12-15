import * as Core from '@/core';

/**
 * Handles mute filtering for post streams.
 */
export class MuteFilter {
  private constructor() {}

  static async getMutedUserIds(): Promise<Set<Core.Pubky>> {
    const mutedStream = await Core.LocalStreamUsersService.findById(Core.UserStreamTypes.MUTED);
    return new Set(mutedStream?.stream ?? []);
  }

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
