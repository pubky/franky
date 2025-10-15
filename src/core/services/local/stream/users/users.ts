import * as Core from '@/core';
import * as Libs from '@/libs';

export class LocalStreamUsersService {
  /**
   * Persists user data to local database
   *
   * @param users - Array of users from Nexus API
   */
  static async persistUsers(users: Core.NexusUser[]): Promise<void> {
    try {
      await Promise.all([
        Core.UserCountsModel.bulkSave(users.map((user) => [user.details.id, user.counts])),
        Core.UserDetailsModel.bulkSave(users.map((user) => user.details)),
        Core.UserRelationshipsModel.bulkSave(users.map((user) => [user.details.id, user.relationship])),
        Core.UserTagsModel.bulkSave(users.map((user) => [user.details.id, user.tags])),
      ]);

      Libs.Logger.debug('Users persisted successfully', { count: users.length });
    } catch (error) {
      Libs.Logger.error('Failed to persist users', { error, count: users.length });
      throw error;
    }
  }

  static async persistUserStream(users: string[]): Promise<void> {
    try {
      // fetch all the users in the posts
      const filteredUsers = await Core.UserDetailsModel.findByIdsPreserveOrder(users);

      // now get the user id from the filtededUSers that are undefined,
      // I want to search from nexus api those undefined users

      // get the users that are undefined
      const undefinedUsers = filteredUsers.reduce((acc, user, index) => {
        if (user === undefined) {
          acc.push(users[index]);
        }
        return acc;
      }, [] as string[]);
      // remove duplicates
      const uniqueUndefinedUsers = [...new Set(undefinedUsers)];

      const usersData = await Core.NexusUserStreamService.fetchByIds({ user_ids: uniqueUndefinedUsers });
      await this.persistUsers(usersData);
    } catch (error) {
      Libs.Logger.error('Failed to persist user stream', { error });
      throw error;
    }
  }
}
