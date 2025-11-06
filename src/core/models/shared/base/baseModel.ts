import { IndexableType, Table, UpdateSpec } from 'dexie';
import * as Libs from '@/libs';

/**
 * Shared base class for Dexie-backed models exposing common CRUD/query helpers.
 */
export abstract class ModelBase<Id, Schema extends { id: Id }> {
  id: Id;

  protected constructor(data: Schema) {
    this.id = data.id;
  }

  /**
   * Create a new record (strict insert). Fails if the key already exists.
   */
  static async create<TId, TSchema extends { id: TId }>(this: { table: Table<TSchema> }, data: TSchema) {
    try {
      await this.table.add(data);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.CREATE_FAILED,
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
   * Insert or replace a record (upsert). Replaces the record entirely if it exists.
   */
  static async upsert<TId, TSchema extends { id: TId }>(this: { table: Table<TSchema> }, data: TSchema) {
    try {
      await this.table.put(data);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.UPSERT_FAILED,
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
   * Partially update a record by id. Returns the number of modified rows (0 if none).
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
        Libs.DatabaseErrorType.UPDATE_FAILED,
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
   * Find a single record by its id and wrap it into a model instance.
   *
   * Returns the concrete model (`TModel`) or `null` when not found. This method
   * materializes a model instance so callers can immediately use instance-level
   * behavior (methods, derived accessors, invariants), not just raw data.
   */
  static async findById<TId, TSchema extends { id: TId }, TModel extends ModelBase<TId, TSchema>>(
    this: { table: Table<TSchema>; new (data: TSchema): TModel },
    id: TId,
  ): Promise<TModel | null> {
    try {
      const record = await this.table.get(id);
      if (!record) {
        return null;
      }
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
   * Find multiple records by their ids.
   *
   * Returns an array of raw schema objects (`TSchema`). It does not construct
   * model instances for performance reasons when fetching many records.
   */
  static async findByIds<TId, TSchema extends { id: TId }>(
    this: { table: Table<TSchema> },
    ids: TId[],
  ): Promise<TSchema[]> {
    try {
      return await this.table
        .where('id')
        .anyOf(ids as IndexableType[])
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
   * Find multiple records by their ids, preserving input order.
   *
   * Returns an array where each element is the raw schema (`TSchema`) or `undefined`
   * if the corresponding id was not found. This method is schema-oriented by
   * design (no model construction) to keep batch lookups lightweight. If you
   * need model instances, compose on top by mapping non-null entries to
   * `new this(row)`.
   */
  static async findByIdsPreserveOrder<TId, TSchema extends { id: TId }>(
    this: { table: Table<TSchema> },
    ids: TId[],
  ): Promise<Array<TSchema | undefined>> {
    try {
      return await this.table.bulkGet(ids as IndexableType[]);
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
   * Delete a record by id.
   */
  static async deleteById<TId, TSchema extends { id: TId }>(this: { table: Table<TSchema> }, id: TId): Promise<void> {
    try {
      await this.table.delete(id);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.DELETE_FAILED,
        `Failed to delete record in ${this.table.name}: ${String(id)}`,
        500,
        {
          error,
          id,
        },
      );
    }
  }

  /**
   * Clear all records from the table.
   */
  static async clear<TId, TSchema extends { id: TId }>(this: { table: Table<TSchema> }): Promise<void> {
    try {
      await this.table.clear();
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.DELETE_FAILED,
        `Failed to clear table ${this.table.name}`,
        500,
        {
          error,
        },
      );
    }
  }
}
