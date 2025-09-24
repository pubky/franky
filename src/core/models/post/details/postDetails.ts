import { Table } from 'dexie';

import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostDetailsModel implements Core.PostDetailsModelSchema {
  private static table: Table<Core.PostDetailsModelSchema> = Core.db.table('post_details');

  id: string;
  content: string;
  indexed_at: number;
  author: Core.Pubky;
  kind: Core.NexusPostKind;
  uri: string;
  attachments: string[] | null;

  constructor(postDetails: Core.PostDetailsModelSchema) {
    this.id = postDetails.id;
    this.content = postDetails.content;
    this.indexed_at = postDetails.indexed_at;
    this.author = postDetails.author;
    this.kind = postDetails.kind;
    this.uri = postDetails.uri;
    this.attachments = postDetails.attachments;
  }

  static async insert(postDetails: Core.PostDetailsModelSchema) {
    try {
      return await PostDetailsModel.table.put(postDetails);
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.SAVE_FAILED, 'Failed to insert post details', 500, {
        error,
        postDetails,
      });
    }
  }

  static async findById(id: string): Promise<PostDetailsModel> {
    try {
      const postDetails = await PostDetailsModel.table.get(id);
      if (!postDetails) {
        throw Libs.createDatabaseError(Libs.DatabaseErrorType.USER_NOT_FOUND, `Post details not found: ${id}`, 404, {
          postDetailsId: id,
        });
      }

      Libs.Logger.debug('Found post details', { id });

      return new Core.PostDetailsModel(postDetails);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, `Failed to find post details ${id}`, 500, {
        error,
        postDetailsId: id,
      });
    }
  }

  static async bulkSave(postDetails: Core.NexusPostDetails[]) {
    try {
      const postsToSave = postDetails.map((postDetail) => new PostDetailsModel(postDetail));
      return await PostDetailsModel.table.bulkPut(postsToSave);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.BULK_OPERATION_FAILED,
        'Failed to bulk save post details',
        500,
        {
          error,
          postDetails,
        },
      );
    }
  }
}
