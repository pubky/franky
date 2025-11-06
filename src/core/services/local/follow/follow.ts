import * as Core from '@/core';
import * as Libs from '@/libs';

export class LocalFollowService {
  static async create({ follower, followee }: Core.TFollowParams) {
    try {
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
}
