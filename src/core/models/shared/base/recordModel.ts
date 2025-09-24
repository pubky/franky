import { Table } from 'dexie';
import * as Libs from '@/libs';

// Base for models whose bulkSave input is an array of full records (already include id)
export abstract class RecordModelBase<Id, Schema extends { id: Id }> {
  id: Id;

  protected constructor(data: Schema) {
    this.id = data.id;
  }

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

  static async findById<TId, TSchema extends { id: TId }, TModel extends RecordModelBase<TId, TSchema>>(
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

  static async bulkSave<TId, TSchema extends { id: TId }>(this: { table: Table<TSchema> }, records: TSchema[]) {
    try {
      return await this.table.bulkPut(records);
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.BULK_OPERATION_FAILED, 'Failed to bulk save records', 500, {
        error,
        records,
      });
    }
  }
}
