import { type UserPK, type Timestamp, type SyncStatus } from '@/database/types';
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
import { Tag } from './shared/Tag';
import { User as UserType } from '@/database/schemas/user';

export class User implements NexusUser {
  private static table: Table<UserSchema> = db.table('users');

  id: UserPK;
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

  constructor(user: UserType) {
    this.id = user.id;
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

  async edit(updates: Partial<UserType>): Promise<void> {
    try {
      const now = Date.now();

      if (updates.details) this.details = { ...this.details, ...updates.details };
      if (updates.counts) this.counts = { ...this.counts, ...updates.counts };
      if (updates.tags) this.tags = updates.tags.map((tag) => new Tag(tag));
      if (updates.relationship) this.relationship = { ...this.relationship, ...updates.relationship };
      if (updates.following) this.following = updates.following;
      if (updates.followers) this.followers = updates.followers;
      if (updates.muted) this.muted = updates.muted;
      if (updates.indexed_at) this.indexed_at = updates.indexed_at;

      this.updated_at = now;
      this.sync_ttl = now + SYNC_TTL;

      await this.save();

      logger.debug('Updated user:', { id: this.details.id, updates });
    } catch (error) {
      logger.error('Failed to edit user:', error);
      throw error;
    }
  }

  static async insert(user: NexusUser): Promise<User> {
    try {
      const now = Date.now();
      const newUser = new User({
        ...user,
        id: user.details.id,
        following: [],
        followers: [],
        muted: [],
        indexed_at: null,
        updated_at: now,
        sync_status: 'local',
        sync_ttl: now + SYNC_TTL,
      });

      await newUser.save();
      logger.debug('Created user:', { id: newUser.details.id });
      return newUser;
    } catch (error) {
      logger.error('Failed to create user:', error);
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

  static async findById(id: UserPK): Promise<User> {
    try {
      const userData = await this.table.get(id);
      if (!userData) throw new Error(`User not found: ${id}`);

      logger.debug('Found user:', { id });
      return new User(userData);
    } catch (error) {
      logger.error('Failed to find user:', error);
      throw error;
    }
  }

  static async find(userPKs: UserPK[]): Promise<User[]> {
    try {
      const users = await this.table.where('id').anyOf(userPKs).toArray();
      logger.debug('Found users:', users);
      if (users.length !== userPKs.length)
        throw new Error(`Failed to find all users: ${userPKs.length - users.length} users not found`);
      logger.debug('Found users:', users);
      return users.map((userData) => new User(userData));
    } catch (error) {
      logger.error('Failed to find users:', error);
      throw error;
    }
  }

  static async bulkSave(users: NexusUser[]): Promise<User[]> {
    try {
      const now = Date.now();
      const usersToSave: UserSchema[] = users.map((user) => ({
        ...user,
        id: user.details.id,
        following: [],
        followers: [],
        muted: [],
        indexed_at: null,
        updated_at: now,
        sync_status: 'local' as const,
        sync_ttl: now + SYNC_TTL,
      }));

      await db.transaction('rw', this.table, async () => {
        await this.table.bulkPut(usersToSave);
      });

      const results = usersToSave.map((userData) => new User(userData));
      logger.debug('Bulk saved users:', { users: users.map((user) => user.details.id) });
      return results;
    } catch (error) {
      logger.error('Failed to bulk save users:', error);
      throw error;
    }
  }

  static async bulkDelete(userPKs: UserPK[]): Promise<void> {
    try {
      await db.transaction('rw', this.table, async () => {
        await this.table.bulkDelete(userPKs);
      });
      logger.debug('Bulk deleted users:', { userPKs });
    } catch (error) {
      logger.error('Failed to bulk delete users:', error);
      throw error;
    }
  }
}
