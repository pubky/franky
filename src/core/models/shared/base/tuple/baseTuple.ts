import { IndexableType, Table } from 'dexie';

import * as Libs from '@/libs';
import { NexusModelTuple } from './baseTuple.type';

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

  static async findById<TId, TSchema extends { id: TId }, TModel extends TupleModelBase<TId, TSchema>>(
    this: { table: Table<TSchema>; new (data: TSchema): TModel },
    id: TId,
  ): Promise<TModel | null> {
    try {
      const record = await this.table.get(id);
      if (!record) {
        return null;
      }
      Libs.Logger.debug(`Found record in ${this.table.name}`, { id });
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

  static async exists<TId, TSchema extends { id: TId }>(this: { table: Table<TSchema> }, id: TId) {
    try {
      return (
        (await this.table
          .where('id')
          .equals(id as IndexableType)
          .count()) > 0
      );
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.QUERY_FAILED,
        `Failed to check if record exists in ${this.table.name}`,
        500,
        {
          error,
          id,
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

  static async bulkSave<TId, TTupleData extends object, TSchema extends { id: TId }>(
    this: { table: Table<TSchema>; toSchema(tuple: NexusModelTuple<TTupleData>): TSchema },
    records: NexusModelTuple<TTupleData>[],
  ) {
    try {
      const toSave = records.map((tuple) => this.toSchema(tuple));
      return await this.table.bulkPut(toSave);
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
