import * as Core from '@/core';

/**
 * Handles mute filtering for post streams.
 */
export class MuteFilter {
  async getMutedUserIds(viewerId: Core.Pubky): Promise<Set<Core.Pubky>> {
    const mutedStreamId = Core.buildUserCompositeId({
      userId: viewerId,
      reach: Core.UserStreamSource.MUTED,
    });
    const mutedStream = await Core.LocalStreamUsersService.findById(mutedStreamId);
    return new Set(mutedStream?.stream ?? []);
  }

  filterPosts(postIds: string[], mutedUserIds: Set<Core.Pubky>): string[] {
    if (mutedUserIds.size === 0) {
      return postIds;
    }
    return postIds.filter((postId) => {
      const { pubky: authorId } = Core.parseCompositeId(postId);
      return !mutedUserIds.has(authorId);
    });
  }
}

export const muteFilter = new MuteFilter();
