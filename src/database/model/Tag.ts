import { type UserPK, type PaginationParams } from '@/database/types';
import { logger } from '@/lib/logger';
import { type NexusTag } from '@/services/nexus/types';
import { DEFAULT_PAGINATION } from '../schemas/defaults/common';

export class Tag implements NexusTag {
  label: string;
  taggers: UserPK[];
  taggers_count: number;
  relationship: boolean;

  constructor(tag: NexusTag) {
    this.label = tag.label;
    this.taggers = tag.taggers;
    this.taggers_count = tag.taggers_count;
    this.relationship = tag.relationship;
  }

  static findByLabel(tags: Tag[], label: string): Tag | undefined {
    return tags.find((tag) => tag.label === label);
  }

  static findByTagger(tags: Tag[], taggerId: UserPK): Tag[] {
    return tags.filter((tag) => tag.taggers.includes(taggerId));
  }

  static getUniqueLabels(tags: Tag[]): string[] {
    return [...new Set(tags.map((tag) => tag.label))];
  }

  hasUser(userId: UserPK): boolean {
    return this.taggers.includes(userId);
  }

  addTagger(userId: UserPK): boolean {
    if (this.hasUser(userId)) return false;

    this.taggers.push(userId);
    this.taggers_count++;
    return true;
  }

  removeTagger(userId: UserPK): boolean {
    const initialLength = this.taggers.length;
    this.taggers = this.taggers.filter((id) => id !== userId);

    if (this.taggers.length < initialLength) {
      this.taggers_count--;
      return true;
    }
    return false;
  }

  getTaggers(pagination: PaginationParams = DEFAULT_PAGINATION): UserPK[] {
    try {
      const { skip, limit } = { ...DEFAULT_PAGINATION, ...pagination };
      logger.debug('Getting taggers with pagination:', {
        label: this.label,
        skip,
        limit,
        total: this.taggers_count,
      });
      return this.taggers.slice(skip, skip + limit);
    } catch (error) {
      logger.error('Failed to get taggers:', error);
      throw error;
    }
  }

  toJSON(): NexusTag {
    return {
      label: this.label,
      taggers: this.taggers,
      taggers_count: this.taggers_count,
      relationship: this.relationship,
    };
  }
}
