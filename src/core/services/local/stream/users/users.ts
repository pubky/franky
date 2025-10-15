import * as Core from '@/core';
import * as Libs from '@/libs';

export class LocalStreamUsersService {
  private constructor() {}

  static async upsert(streamId: Core.UserStreamTypes, stream: string[]): Promise<void> {
    try {
      await Core.UserStreamModel.upsert(streamId, stream);
    } catch (error) {
      Libs.Logger.error('Failed to upsert user stream', { streamId, error });
      throw error;
    }
  }

  static async persistUsers(users: Core.NexusUser[]): Promise<void> {
    try {
      await Promise.all([
        Core.UserCountsModel.bulkSave(users.map((user) => [user.details.id, user.counts])),
        Core.UserDetailsModel.bulkSave(users.map((user) => user.details)),
        Core.UserRelationshipsModel.bulkSave(users.map((user) => [user.details.id, user.relationship])),
        Core.UserTagsModel.bulkSave(users.map((user) => [user.details.id, user.tags])),
      ]);
    } catch (error) {
      Libs.Logger.error('Failed to persist users', { error, count: users.length });
      throw error;
    }
  }
}
