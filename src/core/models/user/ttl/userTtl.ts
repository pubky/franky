import { Table } from 'dexie';

import { Ttl } from '@/core/models/shared';
import { UserTtlModelSchema } from './userTtl.schema';
import * as Core from '@/core';

export class UserTtlModel extends Ttl<Core.Pubky, UserTtlModelSchema> implements UserTtlModelSchema {
  static table: Table<UserTtlModelSchema> = Core.db.table('user_ttl');

  constructor(userTtl: UserTtlModelSchema) {
    super(userTtl);
  }
}
