import type { NexusTag } from '@/core/services/nexus/nexus.types';
import type { Pubky } from '@/core/models/models.types';

export class TagModel implements NexusTag {
  label: string;
  taggers: Pubky[];
  taggers_count: number;
  relationship: boolean;

  constructor(tag: NexusTag) {
    this.label = tag.label;
    this.taggers = tag.taggers;
    this.taggers_count = tag.taggers_count;
    this.relationship = tag.relationship;
  }

  setRelationship(relationship: boolean) {
    this.relationship = relationship;
  }

  addTagger(userId: Pubky): void {
    if (this.taggers.includes(userId)) return; // idempotent
    this.taggers.push(userId);
    this.taggers_count = this.taggers.length;
  }

  removeTagger(userId: Pubky): void {
    if (!this.taggers.includes(userId)) return; // idempotent
    this.taggers = this.taggers.filter((id) => id !== userId);
    this.taggers_count = this.taggers.length;
  }
}
