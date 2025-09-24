import { Table } from 'dexie';

import * as Core from '@/core';
import { UserConnectionsModelSchema } from './userConnections.schema';
import { TupleModelBase } from '@/core/models/shared/base/tupleModel';

export class UserConnectionsModel
  extends TupleModelBase<Core.Pubky, UserConnectionsModelSchema>
  implements UserConnectionsModelSchema
{
  static table: Table<UserConnectionsModelSchema> = Core.db.table('user_connections');

  following: Core.Pubky[];
  followers: Core.Pubky[];

  constructor(userConnections: UserConnectionsModelSchema) {
    super(userConnections);
    this.following = userConnections.following;
    this.followers = userConnections.followers;
  }

  //TODO: Maybe we should add some type for the following and followers
  static toSchema(
    data: Core.NexusModelTuple<Pick<UserConnectionsModelSchema, 'following' | 'followers'>>,
  ): UserConnectionsModelSchema {
    return { id: data[0], ...data[1] } as UserConnectionsModelSchema;
  }
}
