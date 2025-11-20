import { Table } from 'dexie';
import * as Libs from '@/libs';
import { PostStreamModelSchema } from './postStream.schema';
import { db } from '@/core/database';
import { PostStreamId } from './postStream.types';
import { BaseStreamModel } from '@/core/models/shared/stream/stream';

export class PostStreamModel extends BaseStreamModel<PostStreamId, string, PostStreamModelSchema> {
  static table: Table<PostStreamModelSchema> = db.table('post_streams');

  name: string | undefined;

  constructor(stream: PostStreamModelSchema) {
    super(stream);
    this.name = stream.name;
  }

  // TODO: What is it that one?? since when the streams has a name?
  // Custom upsert method to handle name property
  static async createWithName(id: PostStreamId, stream: string[], name: string): Promise<PostStreamModelSchema> {
    try {
      const streamData = { id, name, stream } as PostStreamModelSchema;
      await PostStreamModel.table.put(streamData);

      Libs.Logger.debug('Post Stream row upserted successfully', { streamId: id, name, stream });
      return streamData;
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.UPSERT_FAILED,
        `Failed to upsert PostStream with ID: ${String(id)}`,
        500,
        { error, streamId: id, name, streamLength: stream?.length ?? 0 },
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
