import { Table } from 'dexie';
import {
  type UserModelPK,
  type Timestamp,
  type SyncStatus,
  type UserModelSchema,
  type NexusUser,
  type NexusUserDetails,
  type NexusUserCounts,
  type NexusUserRelationship,
  db,
  TagModel,
} from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';
import { SYNC_TTL } from '@/config/sync';

export class UserModel implements UserModelSchema {
  private static table: Table<UserModelSchema> = db.table('users');

  id: UserModelPK;
  details: NexusUserDetails;
  counts: NexusUserCounts;
  tags: TagModel[];
  relationship: NexusUserRelationship;
  following: UserModelPK[];
  followers: UserModelPK[];
  muted: UserModelPK[];
  indexed_at: Timestamp | null;
  updated_at: Timestamp;
  sync_status: SyncStatus;
  sync_ttl: Timestamp;

  constructor(user: UserModelSchema) {
    this.id = user.id;
    this.details = user.details;
    this.counts = user.counts;
    this.tags = user.tags.map((tag) => new TagModel(tag));
    this.relationship = user.relationship;
    this.following = user.following;
    this.followers = user.followers;
    this.muted = user.muted;
    this.indexed_at = user.indexed_at;
    this.updated_at = user.updated_at;
    this.sync_status = user.sync_status;
    this.sync_ttl = user.sync_ttl;
  }

  // Database operations
  async save(): Promise<void> {
    try {
      const now = Date.now();
      this.updated_at = now;
      this.sync_ttl = now + SYNC_TTL;

      await db.transaction('rw', UserModel.table, async () => {
        await UserModel.table.put({ ...this });
      });

      Logger.debug('Saved user to database:', { id: this.details.id });
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, `Failed to save user ${this.details.id}`, 500, {
        error,
        userId: this.details.id,
      });
    }
  }

  async edit(updates: Partial<UserModelSchema>): Promise<void> {
    try {
      Object.assign(this, updates);

      const now = Date.now();

      this.updated_at = now;
      this.sync_ttl = now + SYNC_TTL;

      await this.save();
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.UPDATE_FAILED, `Failed to update user ${this.details.id}`, 500, {
        error,
        userId: this.details.id,
        updates,
      });
    }
  }

  // user can be NexusUser or UserModelSchema because it can come from the homeserver or the database
  static async insert(user: NexusUser | UserModelSchema): Promise<UserModel> {
    try {
      // check if user is a NexusUser by checking if it has a sync_status property
      const isUserSchema = 'sync_status' in user;
      if (!isUserSchema) {
        user = this.toSchema(user as NexusUser);
      }

      const newUser = new UserModel(user as UserModelSchema);
      await newUser.save();

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
      await db.transaction('rw', UserModel.table, async () => {
        await UserModel.table.delete(this.details.id);
      });

      Logger.debug('Deleted user from database:', { id: this.details.id });
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, `Failed to delete user ${this.details.id}`, 500, {
        error,
        userId: this.details.id,
      });
    }
  }

  static async findById(id: UserModelPK): Promise<UserModel> {
    try {
      const userData = await this.table.get(id);
      if (!userData) {
        throw createDatabaseError(DatabaseErrorType.USER_NOT_FOUND, `User not found: ${id}`, 404, { userId: id });
      }

      Logger.debug('Found user:', { id });

      return new UserModel(userData);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, `Failed to find user ${id}`, 500, {
        error,
        userId: id,
      });
    }
  }

  static async find(userPKs: UserModelPK[]): Promise<UserModel[]> {
    try {
      const users = await this.table.where('id').anyOf(userPKs).toArray();
      if (users.length !== userPKs.length) {
        const missingUsers = userPKs.filter((id) => !users.find((user) => user.id === id));
        throw createDatabaseError(
          DatabaseErrorType.USER_NOT_FOUND,
          `Failed to find all users: ${userPKs.length - users.length} users not found`,
          404,
          { missingUsers },
        );
      }

      Logger.debug('Found users:', users);

      return users.map((userData) => new UserModel(userData));
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to find users', 500, {
        error,
        userIds: userPKs,
      });
    }
  }

  // users can be NexusUser[] or UserModelSchema[] because it can come from the homeserver or the database
  static async bulkSave(users: NexusUser[] | UserModelSchema[]): Promise<UserModel[]> {
    try {
      let usersToSave: UserModelSchema[];
      // check if users are types as NexusUser
      const isUserSchema = users.every((user) => 'sync_status' in user);
      if (!isUserSchema) {
        usersToSave = users.map((user) => this.toSchema(user));
      } else {
        usersToSave = users as UserModelSchema[];
      }

      await db.transaction('rw', this.table, async () => {
        await this.table.bulkPut(usersToSave);
      });

      const results = usersToSave.map((userData) => new UserModel(userData));

      Logger.debug('Bulk saved users:', { users: users.map((user) => user.details.id) });

      return results;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.BULK_OPERATION_FAILED, 'Failed to bulk save users', 500, {
        error,
        userIds: users.map((u) => u.details.id),
      });
    }
  }

  static async bulkDelete(userPKs: UserModelPK[]): Promise<void> {
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

  // convert NexusUser to UserModelSchema
  private static toSchema(user: NexusUser, overrides: Partial<UserModelSchema> = {}): UserModelSchema {
    try {
      const now = Date.now();
      return {
        id: user.details.id,
        details: user.details,
        counts: user.counts,
        tags: user.tags.map((tag) => new TagModel(tag)),
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
