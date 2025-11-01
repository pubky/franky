import { Table } from 'dexie';
// TODO: If we use export * as Core, it happens a circular dependency error
import { TagCollection } from '@/core/models/shared/tag/tagCollection';
import { TagCollectionModelSchema } from '@/core/models/shared/tag/tag.schema';
import { Pubky } from '@/core/models';
import { db } from '@/core/database/franky/franky';

export type UserTagsModelSchema = TagCollectionModelSchema<Pubky>;

export class UserTagsModel extends TagCollection<Pubky, UserTagsModelSchema> implements UserTagsModelSchema {
  static table: Table<UserTagsModelSchema> = db.table('user_tags');

  constructor(data: UserTagsModelSchema) {
    super(data);
  }
}
