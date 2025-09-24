import { Table } from 'dexie';

import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostRelationshipsModel implements Core.PostRelationshipsModelSchema {
  private static table: Table<Core.PostRelationshipsModelSchema> = Core.db.table('post_relationships');

  id: string;
  replied: string | null;
  reposted: string | null;
  mentioned: Core.Pubky[];

  constructor(postRelationships: Core.PostRelationshipsModelSchema) {
    this.id = postRelationships.id;
    this.replied = postRelationships.replied;
    this.reposted = postRelationships.reposted;
    this.mentioned = postRelationships.mentioned;
  }

  static async insert(postRelationships: Core.PostRelationshipsModelSchema) {
    try {
      return await PostRelationshipsModel.table.put(postRelationships);
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.SAVE_FAILED, 'Failed to insert post relationships', 500, {
        error,
        postRelationships,
      });
    }
  }

  static async findById(id: string): Promise<PostRelationshipsModel> {
    try {
      const postRelationships = await PostRelationshipsModel.table.get(id);
      if (!postRelationships) {
        throw Libs.createDatabaseError(
          Libs.DatabaseErrorType.USER_NOT_FOUND,
          `Post relationships not found: ${id}`,
          404,
          {
            postRelationshipsId: id,
          },
        );
      }

      Libs.Logger.debug('Found post relationships', { id });

      return new Core.PostRelationshipsModel(postRelationships);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.QUERY_FAILED,
        `Failed to find post relationships ${id}`,
        500,
        {
          error,
          postRelationshipsId: id,
        },
      );
    }
  }

  static async bulkSave(postRelationships: Core.NexusModelTuple<Core.NexusPostRelationships>[]) {
    try {
      const postsToSave = postRelationships.map((postRelationship) => this.toSchema(postRelationship));
      return await PostRelationshipsModel.table.bulkPut(postsToSave);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.BULK_OPERATION_FAILED,
        'Failed to bulk save post relationships',
        500,
        {
          error,
          postRelationships,
        },
      );
    }
  }

  // Adapter function to convert NexusPostRelationships to PostRelationshipsModelSchema
  private static toSchema(data: Core.NexusModelTuple<Core.NexusPostRelationships>): Core.PostRelationshipsModelSchema {
    return { ...data[1], id: data[0] };
  }
}
