import { Table } from 'dexie';

import * as Libs from '@/libs';
import { NexusModelTuple } from './baseTuple.type';
import { ModelBase } from '@/core/models/shared/base/baseModel';

/**
 * Base class for tuple-oriented models, where bulk operations accept tuples [id, data].
 */
export abstract class TupleModelBase<Id, Schema extends { id: Id }> extends ModelBase<Id, Schema> {
  /**
   * Bulk upsert many tuples at once by converting them with `toSchema` and delegating to Dexie `bulkPut`.
   */
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
          tuplesCount: records.length,
        },
      );
    }
  }
}
