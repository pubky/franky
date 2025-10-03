import { Table } from 'dexie';
import { TagCollection } from '@/core/models/shared/tag/tagCollection';
import { TagCollectionModelSchema } from '@/core/models/shared/tag/tag.schema';
import { db } from '@/core/database/franky/franky';
import * as Core from '@/core';

export class PostTagsModel
  extends TagCollection<string, TagCollectionModelSchema<string>>
  implements TagCollectionModelSchema<string>
{
  static table: Table<TagCollectionModelSchema<string>> = db.table('post_tags');

  constructor(data: TagCollectionModelSchema<string>) {
    super(data);
  }

  saveTag(label: string, taggerId: Core.Pubky) {
    const existingTag = this.tags.find((t) => t.label === label);
    if (existingTag?.relationship) {
      throw new Error('User already tagged this post with this label');
    }

    this.addTagger(label, taggerId);

    const updatedTag = this.tags.find((t) => t.label === label);
    if (updatedTag) {
      updatedTag.relationship = true;
    }
  }

  removeTag(label: string, taggerId: Core.Pubky) {
    const existingTag = this.tags.find((t) => t.label === label);
    if (!existingTag?.relationship) {
      throw new Error('User has not tagged this post with this label');
    }

    this.removeTagger(label, taggerId);

    const updatedTag = this.tags.find((t) => t.label === label);
    if (updatedTag) {
      updatedTag.relationship = false;
    }

    this.tags = this.tags.filter((tag) => tag.taggers_count > 0);
  }
}
