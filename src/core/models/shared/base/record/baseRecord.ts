import { IndexableType, Table, UpdateSpec } from 'dexie';
import * as Libs from '@/libs';

/**
 * Base class for record-oriented models backed by a Dexie table.
 */
export abstract class RecordModelBase<Id, Schema extends { id: Id }> {
  id: Id;

  protected constructor(data: Schema) {
    this.id = data.id;
  }

  /**
   * Create a new record (strict insert).
   * Delegates to Dexie `table.add` and fails if the key already exists.
   *
   * @param this - The model constructor with bound Dexie table
   * @param data - The full schema payload including `id`
   */
  static async create<TId, TSchema extends { id: TId }>(this: { table: Table<TSchema> }, data: TSchema) {
    try {
      await this.table.add(data);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.SAVE_FAILED,
        `Failed to create record in ${this.table.name}`,
        500,
        {
          error,
          data,
        },
      );
    }
  }

  /**
   * Insert or replace a record (upsert).
   * Delegates to Dexie `table.put`. If the record exists, it is replaced entirely.
   *
   * @param this - The model constructor with bound Dexie table
   * @param data - The full schema payload including `id`
   */
  static async upsert<TId, TSchema extends { id: TId }>(this: { table: Table<TSchema> }, data: TSchema) {
    try {
      await this.table.put(data);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.SAVE_FAILED,
        `Failed to upsert record in ${this.table.name}`,
        500,
        {
          error,
          data,
        },
      );
    }
  }

  /**
   * Partially update a record by id.
   * Delegates to Dexie `table.update` and returns the number of modified rows (0 if none).
   *
   * @param this - The model constructor with bound Dexie table
   * @param id - Primary key of the record to update
   * @param changes - Partial fields to set
   * @returns Promise resolving to the number of modified rows
   */
  static async update<TId, TSchema extends { id: TId }>(
    this: { table: Table<TSchema> },
    id: TId,
    changes: UpdateSpec<TSchema>,
  ): Promise<number> {
    try {
      return await this.table.update(id, changes);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.SAVE_FAILED,
        `Failed to update record in ${this.table.name}: ${String(id)}`,
        500,
        {
          error,
          id,
          changes,
        },
      );
    }
  }

  /**
   * Find a record by id and wrap it into the model.
   * Returns null if not found.
   */
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

  /**
   * Find multiple records by their ids and return raw schema objects.
   */
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

  /**
   * Find multiple records by their ids, preserving input order and returning null for missing ones.
   *
   * Example: ids [A, B, C] → result [recordA, null, recordC] if B is missing.
   */
  static async findByIdsWithNulls<TId, TSchema extends { id: TId }>(
    this: { table: Table<TSchema> },
    ids: TId[],
  ): Promise<Array<TSchema | null>> {
    try {
      const found = await this.table
        .where('id')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .anyOf(ids as any)
        .toArray();

      const byId = new Map<TId, TSchema>(found.map((r) => [r.id, r]));
      return ids.map((id) => byId.get(id) ?? null);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.QUERY_FAILED,
        `Failed to find records (with nulls) in ${this.table.name}`,
        500,
        {
          error,
          ids,
        },
      );
    }
  }

  /**
   * Check if a record exists by id.
   *
   * @returns Promise resolving to true if a record exists, false otherwise
   */
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
          records,
        },
      );
    }
  }
}
