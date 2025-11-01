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

  addTagger(taggerId: Core.Pubky): void {
    if (this.taggers.includes(taggerId)) return; // idempotent
    this.taggers.push(taggerId);
    this.taggers_count = this.taggers.length;
  }

  removeTagger(taggerId: Core.Pubky): void {
    if (!this.taggers.includes(taggerId)) return; // idempotent
    this.taggers = this.taggers.filter((id) => id !== taggerId);
    this.taggers_count = this.taggers.length;
  }
}
