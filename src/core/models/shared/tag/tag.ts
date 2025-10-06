import * as Core from '@/core';

export class TagModel implements Core.NexusTag {
  label: string;
  taggers: Core.Pubky[];
  taggers_count: number;
  relationship: boolean;

  constructor(tag: Core.NexusTag) {
    this.label = tag.label;
    this.taggers = tag.taggers;
    this.taggers_count = tag.taggers_count;
    this.relationship = tag.relationship;
  }

  setRelationship(relationship: boolean) {
    this.relationship = relationship;
  }

  addTagger(userId: Core.Pubky) {
    if (this.taggers.includes(userId)) {
      new Error('Tagger already exists');
    }

    this.taggers.push(userId);
    this.taggers_count++;
  }

  removeTagger(userId: Core.Pubky) {
    if (this.taggers.includes(userId)) {
      new Error('Tagger does not exist');
    }
    this.taggers = this.taggers.filter((id) => id !== userId);
    this.taggers_count--;
  }
}
