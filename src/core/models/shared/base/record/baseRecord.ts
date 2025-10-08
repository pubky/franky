import { Table } from 'dexie';
import * as Libs from '@/libs';
import { ModelBase } from '@/core/models/shared/base/baseModel';

/**
 * Base class for record-oriented models backed by a Dexie table.
 */
export abstract class RecordModelBase<Id, Schema extends { id: Id }> extends ModelBase<Id, Schema> {
  /**
   * Bulk upsert many full records at once.
   * Delegates to Dexie `bulkPut`.
   */
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
          rowsCount: records.length,
        },
      );
    }
  }
}
