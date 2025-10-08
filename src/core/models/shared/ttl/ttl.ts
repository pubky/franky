import * as Core from '@/core';
import { ModelBase } from '@/core/models/shared/base/baseModel';
import * as Libs from '@/libs';
import { Table } from 'dexie';

// Each domain row will have its own TTL row. e.g. UserTtlModel, PostTtlModel, etc.
export abstract class Ttl<Id, Schema extends Core.TtlModelSchema<Id>> extends ModelBase<Id, Schema> {
  ttl: number;

  constructor(data: Schema) {
    super(data);
    this.ttl = data.ttl;
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
