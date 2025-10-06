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
    let labelTagData = this.findByLabel(label);
    // The label does not exist, create it
    if (!labelTagData) {
      labelTagData = new Core.TagModel({ label, taggers: [], taggers_count: 0, relationship: false });
      this.tags.push(labelTagData);
    }
    // The label exist and the active user put a tag already
    // This is an edge case, because that action would come directly from the UI and that one would be controlled
    // TODO: Not sure if we neeed to be that harsh
    else if (labelTagData?.relationship) {
      throw new Error('User already tagged this post with this label');
    }
    labelTagData.addTagger(taggerId);
    labelTagData.setRelationship(true);
  }

  removeTag(label: string, taggerId: Core.Pubky) {
    const labelTagData = this.findByLabel(label);
    if (!labelTagData) {
      throw new Error('Tag not found');
    } else if (!labelTagData?.relationship) {
      // TODO: Not sure if we neeed to be that harsh
      throw new Error('User has not tagged this post with this label');
    }

    labelTagData.removeTagger(taggerId);
    labelTagData.setRelationship(false);
    //If there is not taggers, remove the tag
    this.deleteTagIfNoTaggers();
  }
}
