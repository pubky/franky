import { Table } from 'dexie';
import { TagStreamTypes } from './tagStream.types';
import { db } from '@/core/database';
import { TagStreamModelSchema } from './tagStream.schema';
import { BaseStreamModel } from '@/core/models/shared/stream/stream';
import { NexusHotTag } from '@/core/services/nexus/nexus.types';

export class TagStreamModel extends BaseStreamModel<TagStreamTypes, NexusHotTag, TagStreamModelSchema> {
  static table: Table<TagStreamModelSchema> = db.table('tag_streams');

  constructor(stream: TagStreamModelSchema) {
    super(stream);
  }
}
