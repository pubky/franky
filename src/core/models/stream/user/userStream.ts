import { Table } from 'dexie';
import { UserStreamModelSchema } from './userStream.schema';
import { db } from '@/core/database';
import { Pubky } from '@/core';
import { UserStreamTypes } from './userStream.types';
import { BaseStreamModel } from '@/core/models/shared/stream/stream';

export class UserStreamModel extends BaseStreamModel<UserStreamTypes, Pubky, UserStreamModelSchema> {
  static table: Table<UserStreamModelSchema> = db.table('user_streams');

  constructor(stream: UserStreamModelSchema) {
    super(stream);
  }
}
