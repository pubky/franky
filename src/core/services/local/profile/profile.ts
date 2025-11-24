import * as Core from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';

export class LocalProfileService {
  private constructor() {} // Prevent instantiation

  /**
   * Retrieves user details from local database.
   * @param userId - The user ID to fetch details for
   * @returns Promise resolving to user details or null if not found
   */
  static async details({ userId }: Core.TReadProfileParams): Promise<Core.NexusUserDetails | null> {
    return (await Core.UserDetailsModel.findById(userId)) ?? null;
  }

  /**
   * Retrieves user counts from local database.
   * @param userId - The user ID to fetch counts for
   * @returns Promise resolving to user counts or null if not found
   */
  static async counts({ userId }: Core.TReadProfileParams): Promise<Core.NexusUserCounts | null> {
    return (await Core.UserCountsModel.findById(userId)) ?? null;
  }

  /**
   * Upserts user details into local database.
   * @param userDetails - The user details to upsert
   * @returns Promise resolving to void
   */
  static async upsert(userDetails: Core.NexusUserDetails): Promise<void> {
    await Core.UserDetailsModel.upsert(userDetails);
  }

  /**
   * Upserts user counts into local database.
   * @param params - Parameters containing user ID and user counts
   * @param userCounts - The user counts to upsert
   * @returns Promise resolving to void
   */
  static async upsertCounts(params: Core.TReadProfileParams, userCounts: Core.NexusUserCounts): Promise<void> {
    await Core.UserCountsModel.updateCounts(params.userId, userCounts);
  }

  /**
   * Deletes the user account from the local database.
   * @returns Promise resolving to void
   */
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
