import { Table } from 'dexie';

import * as Libs from '@/libs';
import { TagModel } from '@/core/models/shared/tag';
import { TagCollectionModelSchema } from './tag.schema';
import { PaginationParams, Pubky, NexusModelTuple } from '@/core/models/models.types';
import { DEFAULT_PAGINATION } from '@/core/models/models.defaults';
import { NexusTag } from '@/core/services/nexus/nexus.types';

export abstract class TagCollection<Id, Schema extends TagCollectionModelSchema<Id>> {
  id: Id;
  tags: TagModel[];

  constructor(data: Schema) {
    this.id = data.id;
    this.tags = data.tags.map((t) => new TagModel(t));
  }

  // -------- Instance helpers (shared) --------
  findByLabel(label: string): TagModel[] {
    return TagModel.findByLabel(this.tags, label);
  }

  findByTagger(taggerId: Pubky): TagModel[] {
    return TagModel.findByTagger(this.tags, taggerId);
  }

  getUniqueLabels(): string[] {
    return TagModel.getUniqueLabels(this.tags);
  }

  getTaggers(label: string, pagination?: PaginationParams): Pubky[] {
    const tag = this.tags.find((t) => t.label === label);
    return tag ? tag.getTaggers(pagination ?? DEFAULT_PAGINATION) : [];
  }

  addTagger(label: string, userId: Pubky): boolean {
    let tag = this.tags.find((t) => t.label === label);
    if (!tag) {
      tag = new TagModel({ label, taggers: [], taggers_count: 0, relationship: false });
      this.tags.push(tag);
    }
    return tag.addTagger(userId);
  }

  removeTagger(label: string, userId: Pubky): boolean {
    const tag = this.tags.find((t) => t.label === label);
    return tag ? tag.removeTagger(userId) : false;
  }

  // -------- Static CRUD (inherited by subclasses) --------
  // Note: subclasses MUST set their own static "table" field. TS cannot enforce abstract static.
  static async insert<TId, TSchema extends TagCollectionModelSchema<TId>>(
    this: { table: Table<TSchema> },
    data: TSchema,
  ) {
    try {
      return await this.table.put(data);
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.SAVE_FAILED, 'Failed to insert tags', 500, {
        error,
        data,
      });
    }
  }

  static async findById<TId, TSchema extends TagCollectionModelSchema<TId>, TModel extends TagCollection<TId, TSchema>>(
    this: { table: Table<TSchema>; new (data: TSchema): TModel },
    id: TId,
  ): Promise<TModel> {
    try {
      const rec = await this.table.get(id);
      if (!rec) {
        throw Libs.createDatabaseError(Libs.DatabaseErrorType.FIND_FAILED, `Tags not found: ${String(id)}`, 404, {
          tagsId: id,
        });
      }
      Libs.Logger.debug('Found tags', { id });
      return new this(rec);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, `Failed to find tags ${String(id)}`, 500, {
        error,
        tagsId: id,
      });
    }
  }

  static async bulkSave<TId, TSchema extends TagCollectionModelSchema<TId>>(
    this: { table: Table<TSchema> },
    tuples: NexusModelTuple<NexusTag[]>[],
  ) {
    try {
      const toSave = tuples.map((t) => ({ id: t[0] as TId, tags: t[1] }) as TSchema);
      return await this.table.bulkPut(toSave);
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.BULK_OPERATION_FAILED, 'Failed to bulk save tags', 500, {
        error,
        tuples,
      });
    }
  }
}
