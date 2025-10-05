import { Table } from 'dexie';
import * as Libs from '@/libs';
import { UserStreamModelSchema } from './userStream.schema';
import { db } from '@/core/database';
import { createDefaultUserStream } from './userStream.helper';
import { Pubky } from '@/core';
import { UserStreamTypes } from './userStream.types';

export class UserStreamModel implements UserStreamModelSchema {
  private static table: Table<UserStreamModelSchema> = db.table('user_streams');

  id: UserStreamTypes;
  users: Pubky[];

  constructor(stream: UserStreamModelSchema) {
    this.id = stream.id;
    this.users = stream.users || [];
  }

  // Database operations
  async save(): Promise<void> {
    try {
      await UserStreamModel.table.put(this);
      Libs.Logger.debug('UserStream saved successfully', { streamId: this.id });
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.SAVE_FAILED,
        `Failed to save stream with ID: ${this.id}`,
        500,
        { error, streamId: this.id },
      );
    }
  }

  async delete(): Promise<void> {
    try {
      await UserStreamModel.table.delete(this.id);
      Libs.Logger.debug('UserStream deleted successfully', { streamId: this.id });
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.DELETE_FAILED,
        `Failed to delete stream with ID: ${this.id}`,
        500,
        { error, streamId: this.id },
      );
    }
  }

  // Instance methods
  addUsers(users: Pubky[]): void {
    // Filter out users that already exist and add new ones to beginning
    const newUsers = users.filter((userId) => !this.users.includes(userId));
    this.users.unshift(...newUsers); // Add to beginning for chronological order
  }

  // Static methods
  static async findById(id: UserStreamTypes): Promise<UserStreamModel | null> {
    try {
      const stream = await UserStreamModel.table.get(id);
      return stream ? new UserStreamModel(stream) : null;
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.FIND_FAILED, `Failed to find stream with ID: ${id}`, 500, {
        error,
        streamId: id,
      });
    }
  }

  static async create(id: UserStreamTypes, users: Pubky[] = []): Promise<UserStreamModel> {
    try {
      const streamData = createDefaultUserStream(id, users);
      const stream = new UserStreamModel(streamData);
      await stream.save();

      Libs.Logger.debug('UserStream created successfully', { streamId: id, users });
      return stream;
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.CREATE_FAILED,
        `Failed to create stream with ID: ${id}`,
        500,
        { error, streamId: id, users },
      );
    }
  }

  static async deleteById(id: UserStreamTypes): Promise<void> {
    try {
      await UserStreamModel.table.delete(id);
      Libs.Logger.debug('UserStream deleted by ID', { streamId: id });
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.DELETE_FAILED,
        `Failed to delete stream with ID: ${id}`,
        500,
        { error, streamId: id },
      );
    }
  }
}
