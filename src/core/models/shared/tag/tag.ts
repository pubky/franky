import * as Libs from '@/libs';
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

  static findByLabel(tags: TagModel[], label: string): TagModel[] {
    return tags.filter((tag) => tag.label === label);
  }

  static findByTagger(tags: TagModel[], taggerId: Core.Pubky): TagModel[] {
    return tags.filter((tag) => tag.taggers.includes(taggerId));
  }

  static getUniqueLabels(tags: TagModel[]): string[] {
    return [...new Set(tags.map((tag) => tag.label))];
  }

  hasUser(userId: Core.Pubky): boolean {
    return this.taggers.includes(userId);
  }

  addTagger(userId: Core.Pubky): boolean {
    if (this.hasUser(userId)) return false;

    this.taggers.push(userId);
    this.taggers_count++;
    return true;
  }

  removeTagger(userId: Core.Pubky): boolean {
    const initialLength = this.taggers.length;
    this.taggers = this.taggers.filter((id) => id !== userId);

    if (this.taggers.length < initialLength) {
      this.taggers_count--;
      return true;
    }
    return false;
  }

  getTaggers(pagination: Core.PaginationParams = Core.DEFAULT_PAGINATION): Core.Pubky[] {
    try {
      const { skip, limit } = { ...Core.DEFAULT_PAGINATION, ...pagination };
      Libs.Logger.debug('Getting taggers with pagination', {
        label: this.label,
        skip,
        limit,
        total: this.taggers_count,
      });
      return this.taggers.slice(skip ?? 0, (skip ?? 0) + (limit ?? 0));
    } catch (error) {
      Libs.Logger.error('Failed to get taggers', error);
      throw error;
    }
  }
}
