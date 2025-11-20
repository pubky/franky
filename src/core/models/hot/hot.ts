import { Table } from 'dexie';
import { db } from '@/core/database';
import { HotTagsModelSchema } from './hot.schema';
import { NexusHotTag } from '@/core/services/nexus/nexus.types';
import { RecordModelBase } from '@/core/models/shared/base/record/baseRecord';

/**
 * Hot Tags Model
 * Manages hot/trending tags cache in IndexedDB
 */
export class HotTagsModel extends RecordModelBase<string, HotTagsModelSchema> implements HotTagsModelSchema {
  static table: Table<HotTagsModelSchema> = db.table('hot_tags');

  tags: NexusHotTag[];

  constructor(data: HotTagsModelSchema) {
    super(data);
    this.tags = data.tags;
  }
}
