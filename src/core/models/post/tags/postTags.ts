import { Table } from 'dexie';
// TODO: If we use export * as Core, it happens a circular dependency error
import { TagCollection } from '@/core/models/shared/tag/tagCollection';
import { TagCollectionModelSchema } from '@/core/models/shared/tag/tag.schema';
import { db } from '@/core/database/franky/franky';

export type PostTagsModelSchema = TagCollectionModelSchema<string>;

export class PostTagsModel extends TagCollection<string, PostTagsModelSchema> implements PostTagsModelSchema {
  static table: Table<PostTagsModelSchema> = db.table('post_tags');

  constructor(data: PostTagsModelSchema) {
    super(data);
  }
}
