import * as Core from '@/core';
import * as Libs from '@/libs';
import { FOLLOWING_TIMELINE_STREAMS, FRIENDS_TIMELINE_STREAMS } from './follow.constants';

export class LocalFollowService {
  static async create({
    follower,
    followee,
    activeStreamId,
  }: Core.TFollowParams & { activeStreamId?: Core.PostStreamTypes | null }) {
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
            ops.push(Core.UserCountsModel.updateCounts({ userId: follower, countChanges: { following: 1 } }));
          }
          if (addedFollower) {
            ops.push(Core.UserCountsModel.updateCounts({ userId: followee, countChanges: { followers: 1 } }));
          }
          if (isFollowedBy && addedFollowing) {
            becomingFriends = true;
            ops.push(
              Core.UserCountsModel.updateCounts({ userId: follower, countChanges: { friends: 1 } }),
              Core.UserCountsModel.updateCounts({ userId: followee, countChanges: { friends: 1 } }),
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
      await this.updateUserStreams({
        isFollowing: true,
        follower,
        followee,
        friendshipChanged: becomingFriends,
        activeStreamId,
      });

      Libs.Logger.debug('Follow created successfully', { follower, followee });
    } catch (error) {
      Libs.Logger.error('Failed to follow a user', { follower, followee, error });
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.SAVE_FAILED, 'Failed to create follow relationship', 500, {
        error,
      });
    }
  }

  static async delete({
    follower,
    followee,
    activeStreamId,
  }: Core.TFollowParams & { activeStreamId?: Core.PostStreamTypes | null }) {
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
            ops.push(Core.UserCountsModel.updateCounts({ userId: follower, countChanges: { following: -1 } }));
          }
          if (removedFollower) {
            ops.push(Core.UserCountsModel.updateCounts({ userId: followee, countChanges: { followers: -1 } }));
          }
          if (wasFriends && removedFollowing) {
            breakingFriendship = true;
            ops.push(
              Core.UserCountsModel.updateCounts({ userId: follower, countChanges: { friends: -1 } }),
              Core.UserCountsModel.updateCounts({ userId: followee, countChanges: { friends: -1 } }),
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
      await this.updateUserStreams({
        isFollowing: false,
        follower,
        followee,
        friendshipChanged: breakingFriendship,
        activeStreamId,
      });

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
   * Preserves the currently active stream (if provided) to avoid clearing
   * the cache being rendered. All other timeline streams are invalidated.
   *
   * @param includeFriends - Whether to also invalidate friends timelines
   * @param activeStreamId - Optional active stream ID to preserve (passed from controller layer)
   */
  private static async invalidateTimelineStreams(
    includeFriends: boolean,
    activeStreamId?: Core.PostStreamTypes | null,
  ): Promise<void> {
    const streams: Core.PostStreamTypes[] = [...FOLLOWING_TIMELINE_STREAMS];

    if (includeFriends) {
      streams.push(...FRIENDS_TIMELINE_STREAMS);
    }

    // Invalidate all streams except the currently active one
    const streamsToInvalidate = streams.filter((streamId) => streamId !== activeStreamId);

    if (streamsToInvalidate.length > 0) {
      await Promise.all(streamsToInvalidate.map((streamId) => Core.LocalStreamPostsService.deleteById({ streamId })));
      Libs.Logger.debug('Invalidated timeline streams', {
        invalidated: streamsToInvalidate.length,
        preserved: activeStreamId,
      });
    } else {
      Libs.Logger.debug('No timeline streams to invalidate (all preserved)', { activeStreamId });
    }
  }

  /**
   * Update user streams after follow/unfollow and invalidate timeline caches
   *
   * @param isFollowing - True for follow, false for unfollow
   * @param follower - User performing the follow action
   * @param followee - User being followed/unfollowed
   * @param friendshipChanged - Whether this action changes friendship status
   * @param activeStreamId - Optional active stream ID to preserve (passed from controller layer)
   */
  private static async updateUserStreams({
    isFollowing,
    follower,
    followee,
    friendshipChanged,
    activeStreamId,
  }: {
    isFollowing: boolean;
    follower: Core.Pubky;
    followee: Core.Pubky;
    friendshipChanged: boolean;
    activeStreamId?: Core.PostStreamTypes | null;
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
    ops.push(this.invalidateTimelineStreams(friendshipChanged, activeStreamId));

    await Promise.all(ops);
  }
}
