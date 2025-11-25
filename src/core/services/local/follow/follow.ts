import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * Timeline stream groups for invalidation
 * Grouped by reach type (following/friends) for efficient cache clearing
 */
const FOLLOWING_TIMELINE_STREAMS = [
  Core.PostStreamTypes.TIMELINE_FOLLOWING_ALL,
  Core.PostStreamTypes.TIMELINE_FOLLOWING_SHORT,
  Core.PostStreamTypes.TIMELINE_FOLLOWING_LONG,
  Core.PostStreamTypes.TIMELINE_FOLLOWING_IMAGE,
  Core.PostStreamTypes.TIMELINE_FOLLOWING_VIDEO,
  Core.PostStreamTypes.TIMELINE_FOLLOWING_LINK,
  Core.PostStreamTypes.TIMELINE_FOLLOWING_FILE,
  Core.PostStreamTypes.POPULARITY_FOLLOWING_ALL,
  Core.PostStreamTypes.POPULARITY_FOLLOWING_SHORT,
  Core.PostStreamTypes.POPULARITY_FOLLOWING_LONG,
  Core.PostStreamTypes.POPULARITY_FOLLOWING_IMAGE,
  Core.PostStreamTypes.POPULARITY_FOLLOWING_VIDEO,
  Core.PostStreamTypes.POPULARITY_FOLLOWING_LINK,
  Core.PostStreamTypes.POPULARITY_FOLLOWING_FILE,
] as const;

const FRIENDS_TIMELINE_STREAMS = [
  Core.PostStreamTypes.TIMELINE_FRIENDS_ALL,
  Core.PostStreamTypes.TIMELINE_FRIENDS_SHORT,
  Core.PostStreamTypes.TIMELINE_FRIENDS_LONG,
  Core.PostStreamTypes.TIMELINE_FRIENDS_IMAGE,
  Core.PostStreamTypes.TIMELINE_FRIENDS_VIDEO,
  Core.PostStreamTypes.TIMELINE_FRIENDS_LINK,
  Core.PostStreamTypes.TIMELINE_FRIENDS_FILE,
  Core.PostStreamTypes.POPULARITY_FRIENDS_ALL,
  Core.PostStreamTypes.POPULARITY_FRIENDS_SHORT,
  Core.PostStreamTypes.POPULARITY_FRIENDS_LONG,
  Core.PostStreamTypes.POPULARITY_FRIENDS_IMAGE,
  Core.PostStreamTypes.POPULARITY_FRIENDS_VIDEO,
  Core.PostStreamTypes.POPULARITY_FRIENDS_LINK,
  Core.PostStreamTypes.POPULARITY_FRIENDS_FILE,
] as const;

export class LocalFollowService {
  static async create({ follower, followee }: Core.TFollowParams) {
    try {
      let becomingFriends = false;

      await Core.db.transaction(
        'rw',
        [Core.UserCountsModel.table, Core.UserConnectionsModel.table, Core.UserRelationshipsModel.table],
        async () => {
          const rel = await Core.UserRelationshipsModel.findById(followee);
          // Snapshot: whether followee already follows follower
          const isFollowedBy = !!rel?.followed_by;

          // Connections first
          const [addedFollowing, addedFollower] = await Promise.all([
            Core.UserConnectionsModel.createConnection(follower, followee, Core.UserConnectionsFields.FOLLOWING),
            Core.UserConnectionsModel.createConnection(followee, follower, Core.UserConnectionsFields.FOLLOWERS),
          ]);

          // Gate counts by actual mutations; do not upsert counts
          const ops: Promise<unknown>[] = [];
          if (addedFollowing) {
            ops.push(Core.UserCountsModel.updateCounts(follower, { following: 1 }));
          }
          if (addedFollower) {
            ops.push(Core.UserCountsModel.updateCounts(followee, { followers: 1 }));
          }
          if (isFollowedBy && addedFollowing) {
            becomingFriends = true;
            ops.push(
              Core.UserCountsModel.updateCounts(follower, { friends: 1 }),
              Core.UserCountsModel.updateCounts(followee, { friends: 1 }),
            );
          }

          // Upsert relationship (create or update)
          if (rel) {
            if (rel.following === false) {
              ops.push(Core.UserRelationshipsModel.update(followee, { following: true }));
            }
          } else {
            ops.push(
              Core.UserRelationshipsModel.create({ id: followee, following: true, followed_by: false, muted: false }),
            );
          }

          await Promise.all(ops);
        },
      );

      // Update user streams and invalidate timeline streams (outside transaction)
      await this.updateUserStreams({ isFollowing: true, follower, followee, friendshipChanged: becomingFriends });

      Libs.Logger.debug('Follow created successfully', { follower, followee });
    } catch (error) {
      Libs.Logger.error('Failed to follow a user', { follower, followee, error });
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.SAVE_FAILED, 'Failed to create follow relationship', 500, {
        error,
      });
    }
  }

  static async delete({ follower, followee }: Core.TFollowParams) {
    try {
      let breakingFriendship = false;

      await Core.db.transaction(
        'rw',
        [Core.UserCountsModel.table, Core.UserConnectionsModel.table, Core.UserRelationshipsModel.table],
        async () => {
          const rel = await Core.UserRelationshipsModel.findById(followee);
          const wasFriends = !!rel?.followed_by && !!rel?.following;

          // Connections first
          const [removedFollowing, removedFollower] = await Promise.all([
            Core.UserConnectionsModel.deleteConnection(follower, followee, Core.UserConnectionsFields.FOLLOWING),
            Core.UserConnectionsModel.deleteConnection(followee, follower, Core.UserConnectionsFields.FOLLOWERS),
          ]);

          // Gate counts by actual mutations; do not upsert counts
          const ops: Promise<unknown>[] = [];
          if (removedFollowing) {
            ops.push(Core.UserCountsModel.updateCounts(follower, { following: -1 }));
          }
          if (removedFollower) {
            ops.push(Core.UserCountsModel.updateCounts(followee, { followers: -1 }));
          }
          if (wasFriends && removedFollowing) {
            breakingFriendship = true;
            ops.push(
              Core.UserCountsModel.updateCounts(follower, { friends: -1 }),
              Core.UserCountsModel.updateCounts(followee, { friends: -1 }),
            );
          }

          // Upsert relationship (create or update) with following=false
          if (rel) {
            if (rel.following === true) {
              ops.push(Core.UserRelationshipsModel.update(followee, { following: false }));
            }
          } else {
            ops.push(
              Core.UserRelationshipsModel.create({ id: followee, following: false, followed_by: false, muted: false }),
            );
          }

          await Promise.all(ops);
        },
      );

      // Update user streams and invalidate timeline streams (outside transaction)
      await this.updateUserStreams({ isFollowing: false, follower, followee, friendshipChanged: breakingFriendship });

      Libs.Logger.debug('Unfollow completed successfully', { follower, followee });
    } catch (error) {
      Libs.Logger.error('Failed to unfollow a user', { follower, followee, error });
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.DELETE_FAILED,
        'Failed to delete follow relationship',
        500,
        {
          error,
        },
      );
    }
  }

  /**
   * Invalidate timeline streams by clearing them from cache
   * Forces fresh fetch from Nexus on next load
   *
   * @param includeFriends - Whether to also invalidate friends timelines
   */
  private static async invalidateTimelineStreams(includeFriends: boolean): Promise<void> {
    const streams: Core.PostStreamTypes[] = [...FOLLOWING_TIMELINE_STREAMS];

    if (includeFriends) {
      streams.push(...FRIENDS_TIMELINE_STREAMS);
    }

    await Promise.all(streams.map((streamId) => Core.LocalStreamPostsService.deleteById(streamId)));
  }

  /**
   * Update user streams after follow/unfollow and invalidate timeline caches
   *
   * @param isFollowing - True for follow, false for unfollow
   * @param follower - User performing the follow action
   * @param followee - User being followed/unfollowed
   * @param friendshipChanged - Whether this action changes friendship status
   */
  private static async updateUserStreams({
    isFollowing,
    follower,
    followee,
    friendshipChanged,
  }: {
    isFollowing: boolean;
    follower: Core.Pubky;
    followee: Core.Pubky;
    friendshipChanged: boolean;
  }): Promise<void> {
    const ops: Promise<unknown>[] = [];

    // Select the appropriate stream operation based on action
    const streamOp = isFollowing
      ? Core.LocalStreamUsersService.prependToStream
      : Core.LocalStreamUsersService.removeFromStream;

    // Update following/followers streams
    ops.push(
      streamOp.call(Core.LocalStreamUsersService, `${follower}:${Core.UserStreamReach.FOLLOWING}`, [followee]),
      streamOp.call(Core.LocalStreamUsersService, `${followee}:${Core.UserStreamReach.FOLLOWERS}`, [follower]),
    );

    // Update friends streams if friendship status changed
    if (friendshipChanged) {
      ops.push(
        streamOp.call(Core.LocalStreamUsersService, `${follower}:${Core.UserStreamReach.FRIENDS}`, [followee]),
        streamOp.call(Core.LocalStreamUsersService, `${followee}:${Core.UserStreamReach.FRIENDS}`, [follower]),
      );
    }

    // Invalidate timeline caches
    ops.push(this.invalidateTimelineStreams(friendshipChanged));

    await Promise.all(ops);
  }
}
