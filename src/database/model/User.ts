import { type UserPK, type Timestamp, type SyncStatus, type PaginationParams } from '@/database/types';
import { logger } from '@/lib/logger';
import {
  type NexusUser,
  type NexusUserDetails,
  type NexusUserCounts,
  type NexusUserRelationship,
} from '@/services/nexus/types';
import { Table } from 'dexie';
import { db } from '@/database';
import { SYNC_TTL } from '../config';
import { type User as UserSchema } from '../schemas/user';
import { HomeserverActions } from '../types';
import { DEFAULT_PAGINATION } from '../schemas/defaults/common';
import { Tag } from './Tag';

export class User implements NexusUser {
  private static table: Table<UserSchema> = db.table('users');

  details: NexusUserDetails;
  counts: NexusUserCounts;
  tags: Tag[];
  relationship: NexusUserRelationship;
  following: UserPK[];
  followers: UserPK[];
  muted: UserPK[];
  indexed_at: Timestamp | null;
  updated_at: Timestamp;
  sync_status: SyncStatus;
  sync_ttl: Timestamp;

  constructor(
    user: NexusUser & {
      following: UserPK[];
      followers: UserPK[];
      muted: UserPK[];
      indexed_at: Timestamp | null;
      updated_at: Timestamp;
      sync_status: SyncStatus;
      sync_ttl: Timestamp;
    },
  ) {
    this.details = user.details;
    this.counts = user.counts;
    this.tags = user.tags.map((tag) => new Tag(tag));
    this.relationship = user.relationship;
    this.following = user.following;
    this.followers = user.followers;
    this.muted = user.muted;
    this.indexed_at = user.indexed_at;
    this.updated_at = user.updated_at;
    this.sync_status = user.sync_status;
    this.sync_ttl = user.sync_ttl;
  }

  // Relationship methods
  async follow(action: HomeserverActions, targetUser: User): Promise<void> {
    try {
      if (action === 'PUT') {
        // Add following relationship
        if (!this.following.includes(targetUser.details.id)) {
          this.following.push(targetUser.details.id);
          this.counts.following++;
          this.relationship.following = true;
        }

        // Add follower relationship
        if (!targetUser.followers.includes(this.details.id)) {
          targetUser.followers.push(this.details.id);
          targetUser.counts.followers++;
          targetUser.relationship.followed_by = true;
        }

        // Update friends count if both users follow each other
        if (this.following.includes(targetUser.details.id) && targetUser.following.includes(this.details.id)) {
          this.counts.friends++;
          targetUser.counts.friends++;
        }
      } else {
        // Remove following relationship
        this.following = this.following.filter((id) => id !== targetUser.details.id);
        this.counts.following = Math.max(0, this.counts.following - 1);
        this.relationship.following = false;

        // Remove follower relationship
        targetUser.followers = targetUser.followers.filter((id) => id !== this.details.id);
        targetUser.counts.followers = Math.max(0, targetUser.counts.followers - 1);
        targetUser.relationship.followed_by = false;

        // Update friends count
        if (this.counts.friends > 0 && targetUser.counts.friends > 0) {
          this.counts.friends = Math.max(0, this.counts.friends - 1);
          targetUser.counts.friends = Math.max(0, targetUser.counts.friends - 1);
        }
      }

      // Save both users
      await Promise.all([this.save(), targetUser.save()]);
      logger.debug('Updated follow relationship:', { action, fromId: this.details.id, toId: targetUser.details.id });
    } catch (error) {
      logger.error('Failed to update follow relationship:', error);
      throw error;
    }
  }

  async tag(action: HomeserverActions, targetUser: User, label: string): Promise<void> {
    try {
      if (action === 'PUT') {
        const existingTagIndex = targetUser.tags.findIndex((t) => t.label === label);
        if (existingTagIndex >= 0) {
          const existingTag = targetUser.tags[existingTagIndex];
          if (!existingTag.hasUser(this.details.id)) {
            existingTag.addTagger(this.details.id);
            targetUser.counts.tags++;
          }
        } else {
          const newTag = new Tag({
            label,
            relationship: false,
            taggers: [this.details.id],
            taggers_count: 1,
          });
          targetUser.tags.push(newTag);
          targetUser.counts.tags++;
          targetUser.counts.unique_tags++;
        }
        this.counts.tagged++;
      } else {
        const tagIndex = targetUser.tags.findIndex((t) => t.label === label);
        if (tagIndex >= 0) {
          const tag = targetUser.tags[tagIndex];
          if (tag.removeTagger(this.details.id)) {
            targetUser.counts.tags = Math.max(0, targetUser.counts.tags - 1);

            if (tag.taggers_count === 0) {
              targetUser.tags.splice(tagIndex, 1);
              targetUser.counts.unique_tags = Math.max(0, targetUser.counts.unique_tags - 1);
            }
          }
        }
        this.counts.tagged = Math.max(0, this.counts.tagged - 1);
      }

      // Save both users
      await Promise.all([this.save(), targetUser.save()]);
      logger.debug('Updated tag:', { action, fromId: this.details.id, toId: targetUser.details.id, label });
    } catch (error) {
      logger.error('Failed to update tag:', error);
      throw error;
    }
  }

  async mute(action: HomeserverActions, targetUser: User): Promise<void> {
    try {
      if (action === 'PUT') {
        if (!this.muted.includes(targetUser.details.id)) {
          this.muted.push(targetUser.details.id);
          this.relationship.muted = true;
        }
      } else {
        this.muted = this.muted.filter((id) => id !== targetUser.details.id);
        this.relationship.muted = false;
      }

      await this.save();
      logger.debug('Updated mute status:', { action, fromId: this.details.id, toId: targetUser.details.id });
    } catch (error) {
      logger.error('Failed to update mute status:', error);
      throw error;
    }
  }

  // Database operations
  async save(): Promise<void> {
    try {
      const now = Date.now();
      this.updated_at = now;
      this.sync_ttl = now + SYNC_TTL;

      await db.transaction('rw', User.table, async () => {
        await User.table.put({
          ...this,
          id: this.details.id,
        });
      });

      logger.debug('Saved user to database:', { id: this.details.id });
    } catch (error) {
      logger.error('Failed to save user:', error);
      throw error;
    }
  }

  async delete(): Promise<void> {
    try {
      await db.transaction('rw', User.table, async () => {
        await User.table.delete(this.details.id);
      });

      logger.debug('Deleted user from database:', { id: this.details.id });
    } catch (error) {
      logger.error('Failed to delete user:', error);
      throw error;
    }
  }

  async edit(updates: Partial<NexusUser>): Promise<void> {
    try {
      const now = Date.now();

      // Update the instance properties
      if (updates.details) this.details = { ...this.details, ...updates.details };
      if (updates.counts) this.counts = { ...this.counts, ...updates.counts };
      if (updates.tags) this.tags = updates.tags.map((tag) => new Tag(tag));
      if (updates.relationship) this.relationship = { ...this.relationship, ...updates.relationship };

      this.updated_at = now;
      this.sync_ttl = now + SYNC_TTL;

      // Save to database
      await this.save();

      logger.debug('Updated user:', { id: this.details.id, updates });
    } catch (error) {
      logger.error('Failed to update user:', error);
      throw error;
    }
  }

  // Static methods for database operations
  static async findById(id: UserPK): Promise<User | null> {
    try {
      const userData = await this.table.get(id);
      if (!userData) return null;

      return new User(userData);
    } catch (error) {
      logger.error('Failed to find user:', error);
      throw error;
    }
  }

  static async findAll(): Promise<User[]> {
    try {
      const usersData = await this.table.toArray();
      return usersData.map((userData) => new User(userData));
    } catch (error) {
      logger.error('Failed to find all users:', error);
      throw error;
    }
  }

  static async create(user: NexusUser): Promise<User> {
    try {
      const now = Date.now();
      const newUser = new User({
        ...user,
        following: [],
        followers: [],
        muted: [],
        indexed_at: null,
        updated_at: now,
        sync_status: 'local',
        sync_ttl: now + SYNC_TTL,
      });

      await newUser.save();
      return newUser;
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw error;
    }
  }

  async bulkFollow(action: HomeserverActions, targetUsers: User[]): Promise<void> {
    try {
      await Promise.all(targetUsers.map((targetUser) => this.follow(action, targetUser)));
      logger.debug('Bulk follow operation completed:', {
        action,
        fromId: this.details.id,
        toIds: targetUsers.map((u) => u.details.id),
      });
    } catch (error) {
      logger.error('Failed to bulk follow:', error);
      throw error;
    }
  }

  async bulkTag(action: HomeserverActions, targetUsers: User[], label: string): Promise<void> {
    try {
      await Promise.all(targetUsers.map((targetUser) => this.tag(action, targetUser, label)));
      logger.debug('Bulk tag operation completed:', {
        action,
        fromId: this.details.id,
        toIds: targetUsers.map((u) => u.details.id),
        label,
      });
    } catch (error) {
      logger.error('Failed to bulk tag:', error);
      throw error;
    }
  }

  async bulkMute(action: HomeserverActions, targetUsers: User[]): Promise<void> {
    try {
      await Promise.all(targetUsers.map((targetUser) => this.mute(action, targetUser)));
      logger.debug('Bulk mute operation completed:', {
        action,
        fromId: this.details.id,
        toIds: targetUsers.map((u) => u.details.id),
      });
    } catch (error) {
      logger.error('Failed to bulk mute:', error);
      throw error;
    }
  }

  getFollowing(pagination: PaginationParams = DEFAULT_PAGINATION): UserPK[] {
    try {
      const { skip, limit } = { ...DEFAULT_PAGINATION, ...pagination };
      logger.debug('Getting following with pagination:', { skip, limit, userId: this.details.id });
      return this.following.slice(skip, skip + limit);
    } catch (error) {
      logger.error('Failed to get following:', error);
      throw error;
    }
  }

  getFollowers(pagination: PaginationParams = DEFAULT_PAGINATION): UserPK[] {
    try {
      const { skip, limit } = { ...DEFAULT_PAGINATION, ...pagination };
      logger.debug('Getting followers with pagination:', { skip, limit, userId: this.details.id });
      return this.followers.slice(skip, skip + limit);
    } catch (error) {
      logger.error('Failed to get followers:', error);
      throw error;
    }
  }

  getMuted(pagination: PaginationParams = DEFAULT_PAGINATION): UserPK[] {
    try {
      const { skip, limit } = { ...DEFAULT_PAGINATION, ...pagination };
      logger.debug('Getting muted users with pagination:', { skip, limit, userId: this.details.id });
      return this.muted.slice(skip, skip + limit);
    } catch (error) {
      logger.error('Failed to get muted users:', error);
      throw error;
    }
  }
}
