import { Table } from 'dexie';

import * as Core from '@/core';
import * as Libs from '@/libs';

export class UserRelationshipsModel implements Core.UserRelationshipsModelSchema {
  private static table: Table<Core.UserRelationshipsModelSchema> = Core.db.table('user_relationships');

  id: Core.Pubky;
  following: boolean;
  followed_by: boolean;
  muted: boolean;

  constructor(userRelationships: Core.UserRelationshipsModelSchema) {
    this.id = userRelationships.id;
    this.following = userRelationships.following;
    this.followed_by = userRelationships.followed_by;
    this.muted = userRelationships.muted;
  }

  static async insert(userRelationships: Core.UserRelationshipsModelSchema) {
    try {
      return await UserRelationshipsModel.table.put(userRelationships);
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.SAVE_FAILED, 'Failed to insert user relationships', 500, {
        error,
        userRelationships,
      });
    }
  }

  static async findById(id: Core.Pubky): Promise<UserRelationshipsModel> {
    try {
      const userRelationships = await UserRelationshipsModel.table.get(id);
      if (!userRelationships) {
        throw Libs.createDatabaseError(
          Libs.DatabaseErrorType.USER_NOT_FOUND,
          `User relationships not found: ${id}`,
          404,
          { userRelationshipsId: id },
        );
      }

      Libs.Logger.debug('Found user relationships', { id });

      return new Core.UserRelationshipsModel(userRelationships);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.QUERY_FAILED,
        `Failed to find user relationships ${id}`,
        500,
        {
          error,
          userRelationshipsId: id,
        },
      );
    }
  }

  static async bulkSave(userRelationships: Core.NexusModelTuple<Core.NexusUserRelationship>[]) {
    try {
      const usersToSave = userRelationships.map((userRelationship) => this.toSchema(userRelationship));
      return await UserRelationshipsModel.table.bulkPut(usersToSave);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.BULK_OPERATION_FAILED,
        'Failed to bulk save user relationships',
        500,
        {
          error,
          userRelationships,
        },
      );
    }
  }

  // Adapter function to convert NexusUserRelationship to UserRelationshipsModelSchema
  private static toSchema(data: Core.NexusModelTuple<Core.NexusUserRelationship>): Core.UserRelationshipsModelSchema {
    return { id: data[0], ...data[1] };
  }
}
