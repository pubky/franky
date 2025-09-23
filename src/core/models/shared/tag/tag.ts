import { Pubky, PaginationParams, NexusTag, DEFAULT_PAGINATION } from '@/core';
import { Logger } from '@/libs';

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

  static findByLabel(tags: TagModel[], label: string): TagModel[] {
    return tags.filter((tag) => tag.label === label);
  }

  static findByTagger(tags: TagModel[], taggerId: Pubky): TagModel[] {
    return tags.filter((tag) => tag.taggers.includes(taggerId));
  }

  static getUniqueLabels(tags: TagModel[]): string[] {
    return [...new Set(tags.map((tag) => tag.label))];
  }

  hasUser(userId: Pubky): boolean {
    return this.taggers.includes(userId);
  }

  addTagger(userId: Pubky): boolean {
    if (this.hasUser(userId)) return false;

    this.taggers.push(userId);
    this.taggers_count++;
    return true;
  }

  removeTagger(userId: Pubky): boolean {
    const initialLength = this.taggers.length;
    this.taggers = this.taggers.filter((id) => id !== userId);

    if (this.taggers.length < initialLength) {
      this.taggers_count--;
      return true;
    }
    return false;
  }

  getTaggers(pagination: PaginationParams = DEFAULT_PAGINATION): Pubky[] {
    try {
      const { skip, limit } = { ...DEFAULT_PAGINATION, ...pagination };
      Logger.debug('Getting taggers with pagination', {
        label: this.label,
        skip,
        limit,
        total: this.taggers_count,
      });
      return this.taggers.slice(skip ?? 0, (skip ?? 0) + (limit ?? 0));
    } catch (error) {
      Logger.error('Failed to get taggers', error);
      throw error;
    }
  }
}
