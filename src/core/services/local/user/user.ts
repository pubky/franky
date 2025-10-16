import * as Core from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';

export class LocalUserService {
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
        ],
        async () => {
          await Promise.all([
            // User tables
            Core.UserCountsModel.table.clear(),
            Core.UserDetailsModel.table.clear(),
            Core.UserRelationshipsModel.table.clear(),
            Core.UserTagsModel.table.clear(),
            Core.UserConnectionsModel.table.clear(),
            Core.UserTtlModel.table.clear(),
            // Post tables
            Core.PostCountsModel.table.clear(),
            Core.PostDetailsModel.table.clear(),
            Core.PostRelationshipsModel.table.clear(),
            Core.PostTagsModel.table.clear(),
            Core.PostTtlModel.table.clear(),
            // Stream tables
            Core.PostStreamModel.table.clear(),
            Core.UserStreamModel.table.clear(),
            Core.TagStreamModel.table.clear(),
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
