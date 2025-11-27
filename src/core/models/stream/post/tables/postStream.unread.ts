import { Table } from 'dexie';
import { PostStreamModelSchema } from '../postStream.schema';
import { db } from '@/core/database';
import { PostStreamId } from '../postStream.types';
import { BaseStreamModel } from '@/core/models/shared/stream/stream';

export class UnreadPostStreamModel extends BaseStreamModel<PostStreamId, string, PostStreamModelSchema> {
  static table: Table<PostStreamModelSchema> = db.table('unread_post_streams');

  constructor(stream: PostStreamModelSchema) {
    super(stream);
  }
}
