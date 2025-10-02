import { Table } from 'dexie';

import * as Core from '@/core';
import { TupleModelBase } from '@/core/models/shared/base/tuple/baseTuple';

export class PostRelationshipsModel
  extends TupleModelBase<string, Core.PostRelationshipsModelSchema>
  implements Core.PostRelationshipsModelSchema
{
  static table: Table<Core.PostRelationshipsModelSchema> = Core.db.table('post_relationships');

  replied: string | null;
  reposted: string | null;
  mentioned: Core.Pubky[];

  constructor(postRelationships: Core.PostRelationshipsModelSchema) {
    super(postRelationships);
    this.replied = postRelationships.replied;
    this.reposted = postRelationships.reposted;
    this.mentioned = postRelationships.mentioned;
  }

  // Adapter function to convert NexusPostRelationships to PostRelationshipsModelSchema
  static toSchema(data: Core.NexusModelTuple<Core.NexusPostRelationships>): Core.PostRelationshipsModelSchema {
    return { ...data[1], id: data[0] };
  }

  // Query methods
  static async getReplies(postId: string) {
    return this.table.where('replied').equals(postId).toArray();
  }
}
