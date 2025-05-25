import { Table } from 'dexie';
import { logger } from '@/lib/logger';
import {
  type User,
  type UserPK,
  type UserDetails,
  type TagDetails,
  DEFAULT_USER_COUNTS,
  DEFAULT_USER_DETAILS,
  DEFAULT_USER_RELATIONSHIP,
  DEFAULT_SYNC_TTL,
} from '../schemas/user';
import db from '@/database';

export class UserModel {
  private table: Table<User>;

  constructor() {
    this.table = db.table('users');
  }

  // Static Methods (MUTATIONS)

  async new(id: UserPK, details: Partial<UserDetails> = {}): Promise<User> {
    try {
      const now = Date.now();
      const user: User = {
        id,
        details: { ...DEFAULT_USER_DETAILS, ...details },
        counts: { ...DEFAULT_USER_COUNTS },
        relationship: { ...DEFAULT_USER_RELATIONSHIP },
        followers: [],
        following: [],
        tags: [],
        mutes: [],
        indexed_at: null,
        updated_at: now,
        sync_status: 'local',
        sync_ttl: now + DEFAULT_SYNC_TTL,
      };

      await this.table.add(user);
      logger.debug('Created new user:', { id });
      return user;
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw error;
    }
  }

  async edit(user_id: UserPK, details: Partial<UserDetails>): Promise<void> {
    try {
      await this.table.where('id').equals(user_id).modify(user => {
        user.details = { ...user.details, ...details };
        user.updated_at = Date.now();
      });
      logger.debug('Updated user details:', { user_id, details });
    } catch (error) {
      logger.error('Failed to edit user:', error);
      throw error;
    }
  }

  async follow(action: 'PUT' | 'DEL', from_pk: UserPK, to_pk: UserPK): Promise<void> {
    try {
      await db.transaction('rw', this.table, async () => {
        // Update follower's following list and counts
        await this.table.where('id').equals(from_pk).modify(user => {
          if (action === 'PUT') {
            if (!user.following.includes(to_pk)) {
              user.following.push(to_pk);
              user.counts.following++;
            }
          } else {
            user.following = user.following.filter(id => id !== to_pk);
            user.counts.following = Math.max(0, user.counts.following - 1);
          }
          user.updated_at = Date.now();
        });

        // Update followed user's followers list and counts
        await this.table.where('id').equals(to_pk).modify(user => {
          if (action === 'PUT') {
            if (!user.followers.includes(from_pk)) {
              user.followers.push(from_pk);
              user.counts.follower++;
            }
          } else {
            user.followers = user.followers.filter(id => id !== from_pk);
            user.counts.follower = Math.max(0, user.counts.follower - 1);
          }
          user.updated_at = Date.now();
        });
      });
      logger.debug('Updated follow relationship:', { action, from_pk, to_pk });
    } catch (error) {
      logger.error('Failed to update follow relationship:', error);
      throw error;
    }
  }

  async tag(action: 'PUT' | 'DEL', from_pk: UserPK, to_pk: UserPK, label: string): Promise<void> {
    try {
      await this.table.where('id').equals(to_pk).modify(user => {
        if (action === 'PUT') {
          const existingTag = user.tags.find(t => t.label === label);
          if (existingTag) {
            if (!existingTag.taggers.includes(from_pk)) {
              existingTag.taggers.push(from_pk);
              existingTag.taggers_count++;
              user.counts.tagged++;
            }
          } else {
            user.tags.push({
              label,
              relationship: false,
              taggers: [from_pk],
              taggers_count: 1
            });
            user.counts.tags++;
            user.counts.unique_tags++;
            user.counts.tagged++;
          }
        } else {
          const tagIndex = user.tags.findIndex(t => t.label === label);
          if (tagIndex >= 0) {
            const tag = user.tags[tagIndex];
            tag.taggers = tag.taggers.filter(id => id !== from_pk);
            tag.taggers_count--;
            user.counts.tagged = Math.max(0, user.counts.tagged - 1);

            if (tag.taggers.length === 0) {
              user.tags.splice(tagIndex, 1);
              user.counts.tags = Math.max(0, user.counts.tags - 1);
              user.counts.unique_tags = Math.max(0, user.counts.unique_tags - 1);
            }
          }
        }
        user.updated_at = Date.now();
      });
      logger.debug('Updated tag:', { action, from_pk, to_pk, label });
    } catch (error) {
      logger.error('Failed to update tag:', error);
      throw error;
    }
  }

  async mute(action: 'PUT' | 'DEL', from_pk: UserPK, to_pk: UserPK): Promise<void> {
    try {
      await this.table.where('id').equals(from_pk).modify(user => {
        if (action === 'PUT') {
          if (!user.mutes.includes(to_pk)) {
            user.mutes.push(to_pk);
            user.relationship.muted = true;
          }
        } else {
          user.mutes = user.mutes.filter(id => id !== to_pk);
          user.relationship.muted = false;
        }
        user.updated_at = Date.now();
      });
      logger.debug('Updated mute status:', { action, from_pk, to_pk });
    } catch (error) {
      logger.error('Failed to update mute status:', error);
      throw error;
    }
  }

  // Static Methods (REQUESTS)

  async getTags(user_pk: UserPK, skip = 0, limit = 20): Promise<TagDetails[]> {
    try {
      const user = await this.table.get(user_pk);
      if (!user) return [];
      return user.tags.slice(skip, skip + limit);
    } catch (error) {
      logger.error('Failed to get user tags:', error);
      throw error;
    }
  }

  async getTaggers(user_pk: UserPK, label: string): Promise<UserPK[]> {
    try {
      const user = await this.table.get(user_pk);
      if (!user) return [];
      const tag = user.tags.find(t => t.label === label);
      return tag?.taggers || [];
    } catch (error) {
      logger.error('Failed to get taggers:', error);
      throw error;
    }
  }

  async getFollowing(user_pk: UserPK, skip = 0, limit = 20): Promise<UserPK[]> {
    try {
      const user = await this.table.get(user_pk);
      if (!user) return [];
      return user.following.slice(skip, skip + limit);
    } catch (error) {
      logger.error('Failed to get following list:', error);
      throw error;
    }
  }

  async getFollowers(user_pk: UserPK, skip = 0, limit = 20): Promise<UserPK[]> {
    try {
      const user = await this.table.get(user_pk);
      if (!user) return [];
      return user.followers.slice(skip, skip + limit);
    } catch (error) {
      logger.error('Failed to get followers list:', error);
      throw error;
    }
  }

  async getPreview(user_pk: UserPK): Promise<Pick<User, 'id' | 'details' | 'counts'> | null> {
    try {
      const user = await this.table.get(user_pk);
      if (!user) return null;
      return {
        id: user.id,
        details: user.details,
        counts: user.counts,
      };
    } catch (error) {
      logger.error('Failed to get user preview:', error);
      throw error;
    }
  }

  async getName(user_pk: UserPK): Promise<string | null> {
    try {
      const user = await this.table.get(user_pk);
      return user?.details.name || null;
    } catch (error) {
      logger.error('Failed to get user name:', error);
      throw error;
    }
  }

  async getUser(user_pk: UserPK): Promise<User | null> {
    try {
      const user = await this.table.get(user_pk);
      logger.debug('Retrieved user:', { user_pk });
      return user || null;
    } catch (error) {
      logger.error('Failed to get user:', error);
      throw error;
    }
  }
}

export const userModel = new UserModel(); 