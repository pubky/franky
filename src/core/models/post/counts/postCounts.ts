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

  static async updateCounts( { postCompositeId, countChanges }: Core.TPostCountsParams): Promise<void> {
    const postCounts = await Core.PostCountsModel.findById(postCompositeId);
    if (!postCounts) return;

    const updates: Partial<Core.PostCountsModelSchema> = {};

    if (countChanges.replies !== undefined) {
      updates.replies = Math.max(0, postCounts.replies + countChanges.replies);
    }
    if (countChanges.reposts !== undefined) {
      updates.reposts = Math.max(0, postCounts.reposts + countChanges.reposts);
    }
    if (countChanges.tags !== undefined) {
      updates.tags = Math.max(0, postCounts.tags + countChanges.tags);
    }
    if (countChanges.unique_tags !== undefined) {
      updates.unique_tags = Math.max(0, postCounts.unique_tags + countChanges.unique_tags);
    }

    if (Object.keys(updates).length > 0) {
      await Core.PostCountsModel.update(postCompositeId, updates);
    }
  }
}
