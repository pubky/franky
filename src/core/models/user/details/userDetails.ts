import { Table } from 'dexie';

import * as Core from '@/core';
import * as Libs from '@/libs';

export class UserDetailsModel implements Core.UserDetailsModelSchema {
  private static table: Table<Core.UserDetailsModelSchema> = Core.db.table('user_details');

  id: Core.Pubky;
  name: string;
  bio: string;
  image: string | null;
  indexed_at: number;
  links: Core.NexusUserLink[] | null;
  status: string | null;

  constructor(userDetails: Core.UserDetailsModelSchema) {
    this.id = userDetails.id;
    this.name = userDetails.name;
    this.bio = userDetails.bio;
    this.image = userDetails.image;
    this.indexed_at = userDetails.indexed_at;
    this.links = userDetails.links;
    this.status = userDetails.status;
  }

  static async insert(userDetails: Core.UserDetailsModelSchema) {
    try {
      return await UserDetailsModel.table.put(userDetails);
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.SAVE_FAILED, 'Failed to insert user details', 500, {
        error,
        userDetails,
      });
    }
  }

  static async findById(id: Core.Pubky): Promise<UserDetailsModel> {
    try {
      const userDetails = await UserDetailsModel.table.get(id);
      if (!userDetails) {
        throw Libs.createDatabaseError(Libs.DatabaseErrorType.USER_NOT_FOUND, `User details not found: ${id}`, 404, {
          userDetailsId: id,
        });
      }
      Libs.Logger.debug('Found user details', { id });

      return new Core.UserDetailsModel(userDetails);
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, `Failed to find user details ${id}`, 500, {
        error,
        userDetailsId: id,
      });
    }
  }

  static async bulkSave(userDetails: Core.NexusUserDetails[]) {
    try {
      const usersToSave = userDetails.map((userDetail) => new UserDetailsModel(userDetail));
      return await UserDetailsModel.table.bulkPut(usersToSave);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.BULK_OPERATION_FAILED,
        'Failed to bulk save user details',
        500,
        {
          error,
          userDetails,
        },
      );
    }
  }
}
