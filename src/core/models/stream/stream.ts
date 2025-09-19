import { Table } from 'dexie';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class StreamModel implements Core.StreamModelSchema {
  private static table: Table<Core.StreamModelSchema> = Core.db.table('streams');

  // Stream ID pattern: colon-separated segments (e.g., "timeframe:all:all", "timeframe:following:all", "timeframe:all:short:pubky_dev")
  // Can have 1 or more segments separated by colons
  id: string;
  posts: Core.PostModelPK[];
  name: string | null;

  constructor(stream: Core.StreamModelSchema) {
    this.id = stream.id;
    this.posts = stream.posts || [];
    this.name = stream.name;
  }

  // Database operations
  async save(): Promise<void> {
    try {
      await Core.StreamModel.table.put(this);
      Libs.Logger.debug('Stream saved successfully', { streamId: this.id });
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
      await Core.StreamModel.table.delete(this.id);
      Libs.Logger.debug('Stream deleted successfully', { streamId: this.id });
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
  addPosts(postIds: Core.PostModelPK[]): void {
    // Filter out posts that already exist and add new ones to beginning
    const newPosts = postIds.filter((postId) => !this.posts.includes(postId));
    this.posts.unshift(...newPosts); // Add to beginning for chronological order
  }

  // Static methods
  static async findById(id: string): Promise<Core.StreamModel | null> {
    try {
      const stream = await Core.StreamModel.table.get(id);
      return stream ? new Core.StreamModel(stream) : null;
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.FIND_FAILED, `Failed to find stream with ID: ${id}`, 500, {
        error,
        streamId: id,
      });
    }
  }

  static async create(
    id: string,
    name: string | null = null,
    posts: Core.PostModelPK[] = [],
  ): Promise<Core.StreamModel> {
    try {
      const streamData = Core.createDefaultStream(id, name, posts);
      const stream = new Core.StreamModel(streamData);
      await stream.save();

      Libs.Logger.debug('Stream created successfully', { streamId: id, name });
      return stream;
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.CREATE_FAILED,
        `Failed to create stream with ID: ${id}`,
        500,
        { error, streamId: id, name },
      );
    }
  }

  static async deleteById(id: string): Promise<void> {
    try {
      await Core.StreamModel.table.delete(id);
      Libs.Logger.debug('Stream deleted by ID', { streamId: id });
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
