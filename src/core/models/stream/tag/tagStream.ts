import { Table } from 'dexie';
import { TagCollection, TagCollectionModelSchema } from '@/core/models/shared/tag';
import { TagStreamTypes } from './tagStream.types';
import { db } from '@/core/database/franky/franky';

export class TagStreamModel
  extends TagCollection<TagStreamTypes, TagCollectionModelSchema<TagStreamTypes>>
  implements TagCollectionModelSchema<TagStreamTypes>
{
  static table: Table<TagCollectionModelSchema<TagStreamTypes>> = db.table('tag_streams');

  constructor(data: TagCollectionModelSchema<TagStreamTypes>) {
    super(data);
  }
}
