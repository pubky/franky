import { Table } from 'dexie';

import * as Libs from '@/libs';
import { NexusModelTuple } from './baseTuple.type';
import { ModelBase } from '@/core/models/shared/base/baseModel';

/**
 * Extends `ModelBase` with bulk upsert capabilities for tuple-based data that requires
 * transformation via a `toSchema` method. Use this when your model receives data that
 * needs to be converted to schema format before saving.
 *
 * Unlike `RecordModelBase`, which accepts complete record objects directly, this class
 * requires you to implement a static `toSchema` method that converts to schema format.
 */
export abstract class TupleModelBase<Id, Schema extends { id: Id }> extends ModelBase<Id, Schema> {
  /**
   * Bulk upsert many tuples at once by converting them with `toSchema` and delegating to Dexie `bulkPut`.
   *
   * Efficiently saves or updates multiple records by converting tuple format `[id, data]` to schema
   * format using the class's `toSchema` method. This is useful when receiving data from external
   * APIs (like Nexus) that provide data in tuple format.
   *
   * @param records Array of tuples in format `[id, data]` where data is of type `TTupleData`
   * @returns Promise that resolves when the operation completes
   * @throws DatabaseError if the bulk operation fails
   *
   * @requires The class must implement a static `toSchema` method that converts tuples to schema format
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
