import { Table } from 'dexie';

import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostCountsModel implements Core.PostCountsModelSchema {
  private static table: Table<Core.PostCountsModelSchema> = Core.db.table('post_counts');

  id: string;
  tags: number;
  unique_tags: number;
  replies: number;
  reposts: number;

  constructor(postCounts: Core.PostCountsModelSchema) {
    this.id = postCounts.id;
    this.tags = postCounts.tags;
    this.unique_tags = postCounts.unique_tags;
    this.replies = postCounts.replies;
    this.reposts = postCounts.reposts;
  }

  static async insert(postCounts: Core.PostCountsModelSchema) {
    try {
      return await PostCountsModel.table.put(postCounts);
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.SAVE_FAILED, 'Failed to insert post counts', 500, {
        error,
        postCounts,
      });
    }
  }

  static async findById(id: string): Promise<PostCountsModel> {
    try {
      const postCounts = await PostCountsModel.table.get(id);
      if (!postCounts) {
        throw Libs.createDatabaseError(Libs.DatabaseErrorType.USER_NOT_FOUND, `Post counts not found: ${id}`, 404, {
          postCountsId: id,
        });
      }

      Libs.Logger.debug('Found post counts', { id });

      return new Core.PostCountsModel(postCounts);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, `Failed to find post counts ${id}`, 500, {
        error,
        postCountsId: id,
      });
    }
  }

  static async bulkSave(postCounts: Core.NexusModelTuple<Core.NexusPostCounts>[]) {
    try {
      const postsToSave = postCounts.map((postCount) => this.toSchema(postCount));
      return await PostCountsModel.table.bulkPut(postsToSave);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.BULK_OPERATION_FAILED,
        'Failed to bulk save post counts',
        500,
        {
          error,
          postCounts,
        },
      );
    }
  }

  // Adapter function to convert NexusPostCounts to PostCountsModelSchema
  private static toSchema(data: Core.NexusModelTuple<Core.NexusPostCounts>): Core.PostCountsModelSchema {
    return { id: data[0], ...data[1] };
  }
}
