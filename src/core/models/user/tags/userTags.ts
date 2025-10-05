import { Table } from 'dexie';
import { TagCollection } from '@/core/models/shared/tag/tagCollection';
import { TagCollectionModelSchema } from '@/core/models/shared/tag/tag.schema';
import { Pubky } from '@/core/models';
import { db } from '@/core/database/franky/franky';

export class UserTagsModel
  extends TagCollection<Pubky, TagCollectionModelSchema<Pubky>>
  implements TagCollectionModelSchema<Pubky>
{
  static table: Table<TagCollectionModelSchema<Pubky>> = db.table('user_tags');

  constructor(data: TagCollectionModelSchema<Pubky>) {
    super(data);
  }
}
