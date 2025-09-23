import { Table } from 'dexie';

import * as Core from '@/core';
import * as Libs from '@/libs';
import { UserTtlModelSchema } from './userTtl.schema';

export class UserTtlModel implements UserTtlModelSchema {
  private static table: Table<UserTtlModelSchema> = Core.db.table('user_ttl');

  id: Core.Pubky;
  ttl: number;

  constructor(userTtl: UserTtlModelSchema) {
    this.id = userTtl.id;
    this.ttl = userTtl.ttl;
  }

  static async insert(userTtl: UserTtlModelSchema) {
    try {
      return await UserTtlModel.table.put(userTtl);
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.SAVE_FAILED, 'Failed to insert user ttl', 500, {
        error,
        userTtl,
      });
    }
  }

  static async findById(id: Core.Pubky): Promise<UserTtlModel> {
    try {
      const record = await UserTtlModel.table.get(id);
      if (!record) {
        throw Libs.createDatabaseError(Libs.DatabaseErrorType.USER_NOT_FOUND, `UserTtl not found: ${id}`, 404, {
          userTtlId: id,
        });
      }

      Libs.Logger.debug('Found user ttl', { id });

      return new UserTtlModel(record);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, `Failed to find user ttl ${id}`, 500, {
        error,
        userTtlId: id,
      });
    }
  }

  static async bulkSave(records: Core.NexusModelTuple<Pick<UserTtlModelSchema, 'ttl'>>[]) {
    try {
      const toSave = records.map((tuple) => this.toSchema(tuple));
      return await UserTtlModel.table.bulkPut(toSave);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.BULK_OPERATION_FAILED,
        'Failed to bulk save user ttl',
        500,
        {
          error,
          records,
        },
      );
    }
  }

  private static toSchema(data: Core.NexusModelTuple<Pick<UserTtlModelSchema, 'ttl'>>): UserTtlModelSchema {
    return { id: data[0], ...data[1] } as UserTtlModelSchema;
  }
}
