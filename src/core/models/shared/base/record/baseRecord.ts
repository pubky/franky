import { Table } from 'dexie';
import * as Libs from '@/libs';
import { ModelBase } from '@/core/models/shared/base/baseModel';

/**
 * Extends `ModelBase` with bulk upsert capabilities for full record schemas.
 * Use this when your model operates on complete record objects that can be
 * directly saved to the database without transformation.
 */
export abstract class RecordModelBase<Id, Schema extends { id: Id }> extends ModelBase<Id, Schema> {
  /**
   * Bulk upsert many full records at once.
   * 
   * Records must conform to the full schema type. This method will insert new records
   * or update existing ones based on their `id` field.
   * 
   * @param records Array of complete schema objects to save
   * @returns Promise that resolves when the operation completes
   * @throws DatabaseError if the bulk operation fails
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
