import { IndexableType, Table, UpdateSpec } from 'dexie';
import * as Libs from '@/libs';

/**
 * Shared base class for Dexie-backed models exposing common CRUD/query helpers.
 */
export abstract class DexieModelBase<Id, Schema extends { id: Id }> {
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
   * Insert or replace a record (upsert). Replaces the record entirely if it exists.
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
   * Find a record by id and wrap it into the model. Returns null if not found.
   */
  static async findById<TId, TSchema extends { id: TId }, TModel extends DexieModelBase<TId, TSchema>>(
    this: { table: Table<TSchema>; new (data: TSchema): TModel },
    id: TId,
  ): Promise<TModel | null> {
    try {
      const record = await this.table.get(id);
      if (!record) {
        return null;
      }
      Libs.Logger.debug('Found record', { id, table: this.table.name });
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
}
