import { Table } from 'dexie';
import {
  UserPK,
  Timestamp,
  SyncStatus,
  UserSchema,
  db,
  Tag,
  NexusUser,
  NexusUserDetails,
  NexusUserCounts,
  NexusUserRelationship,
} from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';
import { SYNC_TTL } from '@/config/sync';

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

  constructor(user: UserSchema) {
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

      Logger.debug('Saved user to database:', { id: this.details.id });
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, `Failed to save user ${this.details.id}`, 500, {
        error,
        userId: this.details.id,
      });
    }
  }

  async edit(updates: Partial<UserSchema>): Promise<void> {
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

      Logger.debug('Updated user:', { id: this.details.id, updates });
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.UPDATE_FAILED, `Failed to update user ${this.details.id}`, 500, {
        error,
        userId: this.details.id,
        updates,
      });
    }
  }

  static async insert(user: NexusUser): Promise<User> {
    try {
      const newUser = new User(this.toSchema(user));
      await newUser.save();
      Logger.debug('Created user:', { id: newUser.details.id });
      return newUser;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, `Failed to create user ${user.details.id}`, 500, {
        error,
        userId: user.details.id,
      });
    }
  }

  async delete(): Promise<void> {
    try {
      await db.transaction('rw', User.table, async () => {
        await User.table.delete(this.details.id);
      });

      Logger.debug('Deleted user from database:', { id: this.details.id });
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, `Failed to delete user ${this.details.id}`, 500, {
        error,
        userId: this.details.id,
      });
    }
  }

  static async findById(id: UserPK): Promise<User> {
    try {
      const userData = await this.table.get(id);
      if (!userData) {
        throw createDatabaseError(DatabaseErrorType.POST_NOT_FOUND, `User not found: ${id}`, 404, { userId: id });
      }

      Logger.debug('Found user:', { id });
      return new User(userData);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, `Failed to find user ${id}`, 500, {
        error,
        userId: id,
      });
    }
  }

  static async find(userPKs: UserPK[]): Promise<User[]> {
    try {
      const users = await this.table.where('id').anyOf(userPKs).toArray();
      if (users.length !== userPKs.length) {
        const missingUsers = userPKs.filter((id) => !users.find((user) => user.id === id));
        throw createDatabaseError(
          DatabaseErrorType.POST_NOT_FOUND,
          `Failed to find all users: ${userPKs.length - users.length} users not found`,
          404,
          { missingUsers },
        );
      }
      Logger.debug('Found users:', users);
      return users.map((userData) => new User(userData));
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to find users', 500, {
        error,
        userIds: userPKs,
      });
    }
  }

  static async bulkSave(users: NexusUser[]): Promise<User[]> {
    try {
      const usersToSave: UserSchema[] = users.map((user) => this.toSchema(user));

      await db.transaction('rw', this.table, async () => {
        await this.table.bulkPut(usersToSave);
      });

      const results = usersToSave.map((userData) => new User(userData));
      Logger.debug('Bulk saved users:', { users: users.map((user) => user.details.id) });
      return results;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.BULK_OPERATION_FAILED, 'Failed to bulk save users', 500, {
        error,
        userIds: users.map((u) => u.details.id),
      });
    }
  }

  static async bulkDelete(userPKs: UserPK[]): Promise<void> {
    try {
      await db.transaction('rw', this.table, async () => {
        await this.table.bulkDelete(userPKs);
      });
      Logger.debug('Bulk deleted users:', { userPKs });
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.BULK_OPERATION_FAILED, 'Failed to bulk delete users', 500, {
        error,
        userIds: userPKs,
      });
    }
  }

  private static toSchema(user: NexusUser, overrides: Partial<UserSchema> = {}): UserSchema {
    try {
      const now = Date.now();
      return {
        id: user.details.id,
        details: user.details,
        counts: user.counts,
        tags: user.tags.map((tag) => new Tag(tag)),
        relationship: user.relationship,
        following: overrides.following ?? [],
        followers: overrides.followers ?? [],
        muted: overrides.muted ?? [],
        indexed_at: overrides.indexed_at ?? null,
        updated_at: overrides.updated_at ?? now,
        sync_status: overrides.sync_status ?? 'local',
        sync_ttl: overrides.sync_ttl ?? now + SYNC_TTL,
      };
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.INVALID_DATA, 'Failed to convert user to schema', 500, {
        error,
        user,
      });
    }
  }
}
