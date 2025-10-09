import * as Core from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';

export class LocalFollowService {
  static async create({ follower, followee }: Core.TFollowParams) {
    try {
      await Core.db.transaction(
        'rw',
        [Core.UserCountsModel.table, Core.UserConnectionsModel.table, Core.UserRelationshipsModel.table],
        async () => {
          const rel = await Core.UserRelationshipsModel.findById(followee);
          // Check if the `followee` follows `follower`
          const areFriends = !!rel?.followed_by;

          const ops: Promise<unknown>[] = [
            Core.UserCountsModel.updateCount(follower, Core.UserCountsFields.FOLLOWING, 1),
            Core.UserCountsModel.updateCount(followee, Core.UserCountsFields.FOLLOWERS, 1),
            Core.UserConnectionsModel.createConnection(follower, followee, Core.UserConnectionsFields.FOLLOWING),
            Core.UserConnectionsModel.createConnection(followee, follower, Core.UserConnectionsFields.FOLLOWERS),
          ];

          if (areFriends) {
            ops.push(
              Core.UserCountsModel.updateCount(follower, Core.UserCountsFields.FRIENDS, 1),
              Core.UserCountsModel.updateCount(followee, Core.UserCountsFields.FRIENDS, 1),
            );
          }

          if (rel) {
            ops.push(Core.UserRelationshipsModel.update(followee, { following: true }));
          }

          await Promise.all(ops);
        },
      );

      Logger.debug('Follow created successfully', { follower, followee });
    } catch (error) {
      Logger.error('Failed to follow a user', { follower, followee, error });
      throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, 'Failed to create follow relationship', 500, {
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
          // Check if they are friends
          const areFriends = !!rel?.followed_by && !!rel?.following;

          const ops: Promise<unknown>[] = [
            Core.UserCountsModel.updateCount(follower, Core.UserCountsFields.FOLLOWING, -1),
            Core.UserCountsModel.updateCount(followee, Core.UserCountsFields.FOLLOWERS, -1),
            Core.UserConnectionsModel.deleteConnection(follower, followee, Core.UserConnectionsFields.FOLLOWING),
            Core.UserConnectionsModel.deleteConnection(followee, follower, Core.UserConnectionsFields.FOLLOWERS),
          ];

          if (areFriends) {
            ops.push(
              Core.UserCountsModel.updateCount(follower, Core.UserCountsFields.FRIENDS, -1),
              Core.UserCountsModel.updateCount(followee, Core.UserCountsFields.FRIENDS, -1),
            );
          }

          if (rel) {
            ops.push(Core.UserRelationshipsModel.update(followee, { following: false }));
          }

          await Promise.all(ops);
        },
      );

      Logger.debug('Unfollow created successfully', { follower, followee });
    } catch (error) {
      Logger.error('Failed to unfollow a user', { follower, followee, error });
      throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, 'Failed to delete follow relationship', 500, {
        error,
      });
    }
  }
}
