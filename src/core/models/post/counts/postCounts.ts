import { Table } from 'dexie';

import * as Core from '@/core';
import { TupleModelBase } from '@/core/models/shared/base/tuple/baseTuple';

export class PostCountsModel
  extends TupleModelBase<string, Core.PostCountsModelSchema>
  implements Core.PostCountsModelSchema
{
  static table: Table<Core.PostCountsModelSchema> = Core.db.table('post_counts');

  tags: number;
  unique_tags: number;
  replies: number;
  reposts: number;

  constructor(postCounts: Core.PostCountsModelSchema) {
    super(postCounts);
    this.tags = postCounts.tags;
    this.unique_tags = postCounts.unique_tags;
    this.replies = postCounts.replies;
    this.reposts = postCounts.reposts;
  }

  // Adapter function to convert NexusPostCounts to PostCountsModelSchema
  static toSchema(data: Core.NexusModelTuple<Core.NexusPostCounts>): Core.PostCountsModelSchema {
    return { id: data[0], ...data[1] };
  }

  // Query methods
  static async getByIds(ids: string[]) {
    return this.table.where('id').anyOf(ids).toArray();
  }

  static async getById(id: string) {
    return this.table.get(id);
  }
}
