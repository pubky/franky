import { Table } from 'dexie';

import * as Core from '@/core';
import * as Libs from '@/libs';

export class UserCountsModel implements Core.UserCountsModelSchema {
  private static table: Table<Core.UserCountsModelSchema> = Core.db.table('user_counts');

  id: Core.Pubky;
  tagged: number;
  tags: number;
  unique_tags: number;
  posts: number;
  replies: number;
  following: number;
  followers: number;
  friends: number;
  bookmarks: number;

  constructor(userCounts: Core.UserCountsModelSchema) {
    this.id = userCounts.id;
    this.tagged = userCounts.tagged;
    this.tags = userCounts.tags;
    this.unique_tags = userCounts.unique_tags;
    this.posts = userCounts.posts;
    this.replies = userCounts.replies;
    this.following = userCounts.following;
    this.followers = userCounts.followers;
    this.friends = userCounts.friends;
    this.bookmarks = userCounts.bookmarks;
  }

  static async insert(userCounts: Core.UserCountsModelSchema) {
    try {
      return await UserCountsModel.table.put(userCounts);
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.SAVE_FAILED, 'Failed to insert user counts', 500, {
        error,
        userCounts,
      });
    }
  }

  static async findById(id: Core.Pubky): Promise<UserCountsModel> {
    try {
      const userCounts = await UserCountsModel.table.get(id);
      if (!userCounts) {
        throw Libs.createDatabaseError(Libs.DatabaseErrorType.USER_NOT_FOUND, `User counts not found: ${id}`, 404, {
          userCountsId: id,
        });
      }

      Libs.Logger.debug('Found user counts', { id });

      return new Core.UserCountsModel(userCounts);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, `Failed to find user counts ${id}`, 500, {
        error,
        userCountsId: id,
      });
    }
  }

  static async bulkSave(userCounts: Core.NexusModelTuple<Core.NexusUserCounts>[]) {
    try {
      const usersToSave = userCounts.map((userCount) => this.toSchema(userCount));
      return await UserCountsModel.table.bulkPut(usersToSave);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.BULK_OPERATION_FAILED,
        'Failed to bulk save user counts',
        500,
        {
          error,
          userCounts,
        },
      );
    }
  }

  // Adapter function to convert NexusUserCounts to UserCountsModelSchema
  private static toSchema(data: Core.NexusModelTuple<Core.NexusUserCounts>): Core.UserCountsModelSchema {
    return { id: data[0], ...data[1] };
  }
}
