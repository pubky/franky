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
    // Increment count instead of using array length (array may be truncated from Nexus)
    this.taggers_count += 1;
  }

  removeTagger(taggerId: Core.Pubky): void {
    const wasInArray = this.taggers.includes(taggerId);
    this.taggers = this.taggers.filter((id) => id !== taggerId);
    // Decrement count instead of using array length (array may be truncated from Nexus)
    // Only decrement if taggers_count > 0 to avoid negative counts
    if (this.taggers_count > 0) {
      this.taggers_count -= 1;
    }
    // If tagger wasn't in the truncated array but we're removing them,
    // we still decremented the count which is correct
    if (!wasInArray) return; // idempotent for array operations
  }
}
