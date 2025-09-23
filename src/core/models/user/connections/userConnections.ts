import { Table } from 'dexie';

import * as Core from '@/core';
import * as Libs from '@/libs';
import { UserConnectionsModelSchema } from './userConnections.schema';

export class UserConnectionsModel implements UserConnectionsModelSchema {
  private static table: Table<UserConnectionsModelSchema> = Core.db.table('user_connections');

  id: Core.Pubky;
  following: Core.Pubky[];
  followers: Core.Pubky[];

  constructor(userConnections: UserConnectionsModelSchema) {
    this.id = userConnections.id;
    this.following = userConnections.following;
    this.followers = userConnections.followers;
  }

  static async insert(userConnections: UserConnectionsModelSchema) {
    try {
      return await UserConnectionsModel.table.put(userConnections);
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.SAVE_FAILED, 'Failed to insert user connections', 500, {
        error,
        userConnections,
      });
    }
  }

  static async findById(id: Core.Pubky): Promise<UserConnectionsModel> {
    try {
      const record = await UserConnectionsModel.table.get(id);
      if (!record) {
        throw Libs.createDatabaseError(
          Libs.DatabaseErrorType.USER_NOT_FOUND,
          `User connections not found: ${id}`,
          404,
          { userConnectionsId: id },
        );
      }

      Libs.Logger.debug('Found user connections', { id });

      return new Core.UserConnectionsModel(record);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.QUERY_FAILED,
        `Failed to find user connections ${id}`,
        500,
        {
          error,
          userConnectionsId: id,
        },
      );
    }
  }

  static async bulkSave(records: Core.NexusModelTuple<Pick<UserConnectionsModelSchema, 'following' | 'followers'>>[]) {
    try {
      const toSave = records.map((tuple) => this.toSchema(tuple));
      return await UserConnectionsModel.table.bulkPut(toSave);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.BULK_OPERATION_FAILED,
        'Failed to bulk save user connections',
        500,
        {
          error,
          records,
        },
      );
    }
  }

  //TODO: Maybe we should add some type for the following and followers
  private static toSchema(
    data: Core.NexusModelTuple<Pick<UserConnectionsModelSchema, 'following' | 'followers'>>,
  ): UserConnectionsModelSchema {
    return { id: data[0], ...data[1] } as UserConnectionsModelSchema;
  }
}
