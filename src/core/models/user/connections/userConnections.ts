import { Table } from 'dexie';

import * as Core from '@/core';
import { UserConnectionsFields, UserConnectionsModelSchema } from './userConnections.schema';
import { TupleModelBase } from '@/core/models/shared/base/tuple/baseTuple';

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

  static toSchema(
    data: Core.NexusModelTuple<Pick<UserConnectionsModelSchema, 'following' | 'followers'>>,
  ): UserConnectionsModelSchema {
    return { id: data[0], ...data[1] } as UserConnectionsModelSchema;
  }

  /**
   * Add a connection to a user's connection list.
   *
   * Adds the `to` user to the specified connection list (`following` or `followers`)
   * of the `from` user. If the connection already exists, it will be ignored (idempotent).
   * If the user has no connections record yet, one will be created automatically.
   *
   * @param from - The user whose connection list to modify
   * @param to - The user to add to the connection list
   * @param key - The type of connection list: `following` or `followers`
   */
  static async createConnection(from: Core.Pubky, to: Core.Pubky, key: UserConnectionsFields): Promise<boolean> {
    let didChange = false;
    const exists = await this.findById(from);
    // Might be a case, that we did not yet download the user connections, cover that case
    if (!exists) {
      const model = new UserConnectionsModel({ id: from, following: [], followers: [] });
      model[key].push(to);
      await this.create(model);
      didChange = true;
    } else {
      await this.table
        .where('id')
        .equals(from)
        .modify((row) => {
          const list = row[key] ?? [];
          if (!list.includes(to)) {
            list.push(to);
            row[key] = list;
            didChange = true;
          }
        });
    }
    return didChange;
  }

  static async deleteConnection(from: Core.Pubky, to: Core.Pubky, key: UserConnectionsFields): Promise<boolean> {
    let didChange = false;
    const exists = await this.findById(from);
    if (!exists) return false;
    await this.table
      .where('id')
      .equals(from)
      .modify((row) => {
        const list = row[key] ?? [];
        const next = list.filter((item) => item !== to);
        if (next.length !== list.length) {
          row[key] = next;
          didChange = true;
        }
      });
    return didChange;
  }
}
