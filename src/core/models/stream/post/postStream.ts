import { Table } from 'dexie';
import * as Libs from '@/libs';
import { PostStreamModelSchema } from './postStream.schema';
import { db } from '@/core/database';
import { createDefaultPostStream } from './postStream.helper';
import { PostStreamTypes } from './postStream.types';

export class PostStreamModel implements PostStreamModelSchema {
  private static table: Table<PostStreamModelSchema> = db.table('post_streams');

  // Stream ID pattern: colon-separated segments (e.g., "timeframe:all:all", "timeframe:following:all", "timeframe:all:short:pubky_dev")
  // Can have 1 or more segments separated by colons
  id: PostStreamTypes;
  posts: string[];
  name: string | null;

  constructor(stream: PostStreamModelSchema) {
    this.id = stream.id;
    this.posts = stream.posts || [];
    this.name = stream.name;
  }

  // Database operations
  async save(): Promise<void> {
    try {
      await PostStreamModel.table.put(this);
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
      await PostStreamModel.table.delete(this.id);
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
  addPosts(postIds: string[]): void {
    // Filter out posts that already exist and add new ones to beginning
    const newPosts = postIds.filter((postId) => !this.posts.includes(postId));
    this.posts.unshift(...newPosts); // Add to beginning for chronological order
  }

  // Static methods
  static async findById(id: PostStreamTypes): Promise<PostStreamModel | null> {
    try {
      const stream = await PostStreamModel.table.get(id);
      return stream ? new PostStreamModel(stream) : null;
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.FIND_FAILED, `Failed to find stream with ID: ${id}`, 500, {
        error,
        streamId: id,
      });
    }
  }

  static async create(id: PostStreamTypes, name: string | null = null, posts: string[] = []): Promise<PostStreamModel> {
    try {
      const streamData = createDefaultPostStream(id, name, posts);
      const stream = new PostStreamModel(streamData);
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

  static async deleteById(id: PostStreamTypes): Promise<void> {
    try {
      await PostStreamModel.table.delete(id);
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
