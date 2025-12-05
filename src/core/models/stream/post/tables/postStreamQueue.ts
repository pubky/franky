import { Table } from 'dexie';
import * as Libs from '@/libs';
import { db } from '@/core/database';
import { PostStreamId } from '../postStream.types';
import { PostStreamQueueModelSchema } from './postStreamQueue.schema';

export class PostStreamQueueModel implements PostStreamQueueModelSchema {
  static table: Table<PostStreamQueueModelSchema> = db.table('post_stream_queues');

  id: PostStreamId;
  queue: string[];
  streamTail: number;

  constructor(data: PostStreamQueueModelSchema) {
    this.id = data.id;
    this.queue = data.queue;
    this.streamTail = data.streamTail;
  }

  static async findById(id: PostStreamId): Promise<PostStreamQueueModel | null> {
    try {
      const record = await this.table.get(id);
      if (!record) {
        return null;
      }
      return new PostStreamQueueModel(record);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.QUERY_FAILED,
        `Failed to find queue for stream: ${String(id)}`,
        500,
        { error, id },
      );
    }
  }

  static async upsert(data: PostStreamQueueModelSchema): Promise<void> {
    try {
      await this.table.put(data);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.UPSERT_FAILED,
        `Failed to upsert queue for stream: ${String(data.id)}`,
        500,
        { error, id: data.id },
      );
    }
  }

  static async deleteById(id: PostStreamId): Promise<void> {
    try {
      await this.table.delete(id);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.DELETE_FAILED,
        `Failed to delete queue for stream: ${String(id)}`,
        500,
        { error, id },
      );
    }
  }

  static async clear(): Promise<void> {
    try {
      await this.table.clear();
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.DELETE_FAILED,
        'Failed to clear post stream queues table',
        500,
        { error },
      );
    }
  }
}
