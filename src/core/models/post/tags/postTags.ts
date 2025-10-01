import { Table } from 'dexie';
import { TagCollection } from '@/core/models/shared/tag/tagCollection';
import { TagCollectionModelSchema } from '@/core/models/shared/tag/tag.schema';
import { db } from '@/core/database/franky/franky';

export class PostTagsModel
  extends TagCollection<string, TagCollectionModelSchema<string>>
  implements TagCollectionModelSchema<string>
{
  static table: Table<TagCollectionModelSchema<string>> = db.table('post_tags');

  constructor(data: TagCollectionModelSchema<string>) {
    super(data);
  }
}
