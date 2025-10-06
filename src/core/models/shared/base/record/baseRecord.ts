import { Table } from 'dexie';
import * as Libs from '@/libs';

// Base for models whose bulkSave input is an array of full records (already included the id)
export abstract class RecordModelBase<Id, Schema extends { id: Id }> {
  id: Id;

  protected constructor(data: Schema) {
    this.id = data.id;
  }

  static async insert<TId, TSchema extends { id: TId }>(this: { table: Table<TSchema> }, data: TSchema) {
    try {
      return await this.table.put(data);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.SAVE_FAILED,
        `Failed to insert record in ${this.table.name}`,
        500,
        {
          error,
          data,
        },
      );
    }
  }

  static async findById<TId, TSchema extends { id: TId }, TModel extends RecordModelBase<TId, TSchema>>(
    this: { table: Table<TSchema>; new (data: TSchema): TModel },
    id: TId,
  ): Promise<TModel | null> {
    try {
      const record = await this.table.get(id);
      if (!record) {
        return null;
      }
      Libs.Logger.debug('Found record', { id });
      return new this(record);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.QUERY_FAILED,
        `Failed to find record in ${this.table.name}: ${String(id)}`,
        500,
        {
          error,
          id,
        },
      );
    }
  }

  static async findByIds<TId, TSchema extends { id: TId }>(
    this: { table: Table<TSchema> },
    ids: TId[],
  ): Promise<TSchema[]> {
    try {
      return await this.table
        .where('id')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .anyOf(ids as any)
        .toArray();
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.QUERY_FAILED,
        `Failed to find records in ${this.table.name}`,
        500,
        {
          error,
          ids,
        },
      );
    }
  }

  static async count<TId, TSchema extends { id: TId }>(this: { table: Table<TSchema> }) {
    try {
      return await this.table.count();
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.QUERY_FAILED,
        `Failed to count records in ${this.table.name}`,
        500,
        {
          error,
        },
      );
    }
  }

  static async bulkSave<TId, TSchema extends { id: TId }>(this: { table: Table<TSchema> }, records: TSchema[]) {
    try {
      return await this.table.bulkPut(records);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.BULK_OPERATION_FAILED,
        `Failed to bulk save records in ${this.table.name}`,
        500,
        {
          error,
          records,
        },
      );
    }
  }
}
