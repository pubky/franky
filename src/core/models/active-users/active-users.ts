import { Table } from 'dexie';
import { db } from '@/core/database';
import { ActiveUsersModelSchema } from './active-users.schema';
import { Pubky } from '@/core/models/models.types';
import { RecordModelBase } from '@/core/models/shared/base/record/baseRecord';

/**
 * Active Users Model
 * Manages active users (influencers) cache in IndexedDB
 */
export class ActiveUsersModel
  extends RecordModelBase<string, ActiveUsersModelSchema>
  implements ActiveUsersModelSchema
{
  static table: Table<ActiveUsersModelSchema> = db.table('active_users');

  userIds: Pubky[];

  constructor(data: ActiveUsersModelSchema) {
    super(data);
    this.userIds = data.userIds;
  }
}
