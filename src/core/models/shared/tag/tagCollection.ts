import { Table } from 'dexie';

import * as Libs from '@/libs';
import * as Core from '@/core';

export abstract class TagCollection<Id, Schema extends Core.TagCollectionModelSchema<Id>> {
  id: Id;
  tags: Core.TagModel[];

  constructor(data: Schema) {
    this.id = data.id;
    this.tags = data.tags.map((t) => new Core.TagModel(t));
  }

  // -------- Instance helpers (shared) --------

  findByLabel(label: string): Core.TagModel | null {
    const labelTagData = this.tags.filter((t) => t.label === label);
    if (labelTagData.length === 0) {
      return null;
    }
    return labelTagData[0];
  }

  deleteTagIfNoTaggers() {
    this.tags = this.tags.filter((tag) => tag.taggers_count > 0);
  }

  // -------- Static CRUD (inherited by subclasses) --------
  // Note: subclasses MUST set their own static "table" field. TS cannot enforce abstract static.
  static async insert<TId, TSchema extends Core.TagCollectionModelSchema<TId>>(
    this: { table: Table<TSchema> },
    data: TSchema,
  ) {
    try {
      return await this.table.put(data);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.SAVE_FAILED,
        `Failed to insert tags in ${this.table.name}`,
        500,
        {
          error,
          data,
        },
      );
    }
  }

  static async findById<
    TId,
    TSchema extends Core.TagCollectionModelSchema<TId>,
    TModel extends TagCollection<TId, TSchema>,
  >(this: { table: Table<TSchema>; new (data: TSchema): TModel }, id: TId): Promise<TModel | null> {
    try {
      const rec = await this.table.get(id);
      if (!rec) {
        return null;
      }
      Libs.Logger.debug(`Found tags in ${this.table.name}`, { id });
      return new this(rec);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.QUERY_FAILED,
        `Failed to find tags in ${this.table.name}: ${String(id)}`,
        500,
        {
          error,
          tagsId: id,
        },
      );
    }
  }

  static async findByIds<TId, TSchema extends Core.TagCollectionModelSchema<TId>>(
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
        `Failed to find tags in ${this.table.name}`,
        500,
        {
          error,
          ids,
        },
      );
    }
  }

  static async bulkSave<TId, TSchema extends Core.TagCollectionModelSchema<TId>>(
    this: { table: Table<TSchema> },
    tuples: Core.NexusModelTuple<Core.NexusTag[]>[],
  ) {
    try {
      const toSave = tuples.map((t) => ({ id: t[0] as TId, tags: t[1] }) as TSchema);
      return await this.table.bulkPut(toSave);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.BULK_OPERATION_FAILED,
        `Failed to bulk save tags in ${this.table.name}`,
        500,
        {
          error,
          tuples,
        },
      );
    }
  }
}
