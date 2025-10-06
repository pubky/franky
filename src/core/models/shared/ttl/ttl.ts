import { Table } from 'dexie';

import * as Libs from '@/libs';
import * as Core from '@/core';

export abstract class Ttl<Id, Schema extends Core.TtlModelSchema<Id>> {
  id: Id;
  ttl: number;

  constructor(data: Schema) {
    this.id = data.id;
    this.ttl = data.ttl;
  }
  static async insert<TId, TSchema extends Core.TtlModelSchema<TId>>(this: { table: Table<TSchema> }, data: TSchema) {
    try {
      return await this.table.put(data);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.UPSERT_FAILED,
        `Failed to upsert TTL in ${this.table.name}`,
        500,
        {
          error,
          data,
        },
      );
    }
  }

  static async findById<TId, TSchema extends Core.TtlModelSchema<TId>, TModel extends Ttl<TId, TSchema>>(
    this: { table: Table<TSchema>; new (data: TSchema): TModel },
    id: TId,
  ): Promise<TModel> {
    try {
      const record = await this.table.get(id);
      if (!record) {
        throw Libs.createDatabaseError(
          Libs.DatabaseErrorType.USER_NOT_FOUND,
          `TTL not found in ${this.table.name}: ${String(id)}`,
          404,
          {
            ttlId: id,
          },
        );
      }

      return new this(record);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.QUERY_FAILED,
        `Failed to find TTL in ${this.table.name}: ${String(id)}`,
        500,
        {
          error,
          ttlId: id,
        },
      );
    }
  }

  static async bulkSave<TId, TSchema extends Core.TtlModelSchema<TId>>(
    this: { table: Table<TSchema> },
    records: Core.NexusModelTuple<Pick<TSchema, 'ttl'>>[],
  ) {
    try {
      const toSave = records.map((tuple) => ({ id: tuple[0] as TId, ...tuple[1] }) as TSchema);
      return await this.table.bulkPut(toSave);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.BULK_OPERATION_FAILED,
        `Failed to bulk save TTL in ${this.table.name}`,
        500,
        {
          error,
          records,
        },
      );
    }
  }
}
