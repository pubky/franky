import { Table } from 'dexie';

import * as Libs from '@/libs';
import * as Core from '@/core';
import { ModelBase } from '@/core/models/shared/base/baseModel';

export abstract class TagCollection<Id, Schema extends Core.TagCollectionModelSchema<Id>> extends ModelBase<
  Id,
  Schema
> {
  tags: Core.TagModel[];

  constructor(data: Schema) {
    super(data);
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

  // -------- Static CRUD (inherited from ModelBase) --------
  // Note: subclasses MUST set their own static "table" field. TS cannot enforce abstract static.

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
