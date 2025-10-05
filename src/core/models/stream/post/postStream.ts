import { Table } from 'dexie';
import * as Libs from '@/libs';
import { PostStreamModelSchema } from './postStream.schema';
import { db } from '@/core/database';
import { PostStreamTypes } from './postStream.types';
import { BaseStreamModel } from '@/core/models/shared/stream/stream';

export class PostStreamModel extends BaseStreamModel<PostStreamTypes, string, PostStreamModelSchema> {
  static table: Table<PostStreamModelSchema> = db.table('post_streams');

  name: string | undefined;

  constructor(stream: PostStreamModelSchema) {
    super(stream);
    this.name = stream.name;
  }

  // Custom create method to handle name property
  static async createWithName(id: PostStreamTypes, stream: string[], name: string): Promise<PostStreamModelSchema> {
    try {
      const streamData = { id, name, stream } as PostStreamModelSchema;
      await PostStreamModel.table.put(streamData);

      Libs.Logger.debug('Post Stream row created successfully', { streamId: id, name, stream });
      return streamData;
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.CREATE_FAILED,
        `Failed to create PostStream with ID: ${String(id)}`,
        500,
        { error, streamId: id, name, stream },
      );
    }
  }

  // Instance methods
  addPosts(postIds: string[]): void {
    // Filter out posts that already exist and add new ones to beginning
    const newPosts = postIds.filter((postId) => !this.stream.includes(postId));
    this.stream.unshift(...newPosts); // Add to beginning for chronological order
  }
}
