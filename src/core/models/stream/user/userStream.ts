import { Table } from 'dexie';
import { UserStreamModelSchema } from './userStream.schema';
import { db } from '@/core/database';
import { Pubky, UserStreamId } from '@/core';
import { BaseStreamModel } from '@/core/models/shared/stream/stream';

// Using string for ID type to support composite IDs like 'userId:followers'
export class UserStreamModel extends BaseStreamModel<UserStreamId, Pubky, UserStreamModelSchema> {
  static table: Table<UserStreamModelSchema> = db.table('user_streams');

  constructor(stream: UserStreamModelSchema) {
    super(stream);
  }
}
