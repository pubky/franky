import { Table } from 'dexie';

import * as Libs from '@/libs';
import { NexusModelTuple } from '@/core/models/models.types';

// Base for models whose bulkSave input is an array of tuples: [id, data]
export abstract class TupleModelBase<Id, Schema extends { id: Id }> {
  id: Id;

  protected constructor(data: Schema) {
    this.id = data.id;
  }

  // Note: subclasses MUST set their own static table and implement toSchema
  static async insert<TId, TSchema extends { id: TId }>(this: { table: Table<TSchema> }, data: TSchema) {
    try {
      return await this.table.put(data);
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.SAVE_FAILED, 'Failed to insert record', 500, {
        error,
        data,
      });
    }
  }

  static async findById<TId, TSchema extends { id: TId }, TModel extends TupleModelBase<TId, TSchema>>(
    this: { table: Table<TSchema>; new (data: TSchema): TModel },
    id: TId,
  ): Promise<TModel> {
    try {
      const record = await this.table.get(id);
      if (!record) {
        throw Libs.createDatabaseError(Libs.DatabaseErrorType.USER_NOT_FOUND, `Record not found: ${String(id)}`, 404, {
          id,
        });
      }
      Libs.Logger.debug('Found record', { id });
      return new this(record);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, `Failed to find record ${String(id)}`, 500, {
        error,
        id,
      });
    }
  }

  static async bulkSave<TId, TTupleData extends object, TSchema extends { id: TId }>(
    this: { table: Table<TSchema>; toSchema(tuple: NexusModelTuple<TTupleData>): TSchema },
    records: NexusModelTuple<TTupleData>[],
  ) {
    try {
      const toSave = records.map((tuple) => this.toSchema(tuple));
      return await this.table.bulkPut(toSave);
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.BULK_OPERATION_FAILED, 'Failed to bulk save records', 500, {
        error,
        records,
      });
    }
  }
}
