import * as Core from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';

export class LocalProfileService {
  static async deleteAccount() {
    try {
      await Core.db.transaction(
        'rw',
        [
          // User tables
          Core.UserCountsModel.table,
          Core.UserDetailsModel.table,
          Core.UserRelationshipsModel.table,
          Core.UserTagsModel.table,
          Core.UserConnectionsModel.table,
          Core.UserTtlModel.table,
          // Post tables
          Core.PostCountsModel.table,
          Core.PostDetailsModel.table,
          Core.PostRelationshipsModel.table,
          Core.PostTagsModel.table,
          Core.PostTtlModel.table,
          // Stream tables
          Core.PostStreamModel.table,
          Core.UserStreamModel.table,
          Core.TagStreamModel.table,
          // Notifications table
          Core.NotificationModel.table,
        ],
        async () => {
          await Promise.all([
            // User tables
            Core.UserCountsModel.clear(),
            Core.UserDetailsModel.clear(),
            Core.UserRelationshipsModel.clear(),
            Core.UserTagsModel.clear(),
            Core.UserConnectionsModel.clear(),
            Core.UserTtlModel.clear(),
            // Post tables
            Core.PostCountsModel.clear(),
            Core.PostDetailsModel.clear(),
            Core.PostRelationshipsModel.clear(),
            Core.PostTagsModel.clear(),
            Core.PostTtlModel.clear(),
            // Stream tables
            Core.PostStreamModel.clear(),
            Core.UserStreamModel.clear(),
            Core.TagStreamModel.clear(),
            // Notifications table
            Core.NotificationModel.clear(),
          ]);
        },
      );

      Logger.debug('Local user data cleared successfully');
    } catch (error) {
      Logger.error('Failed to clear local user data', { error });
      throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, 'Failed to clear local user data', 500, {
        error,
      });
    }
  }
}
