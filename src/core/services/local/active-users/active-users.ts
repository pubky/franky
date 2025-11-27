import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * Local Active Users Service
 *
 * Manages active users storage in IndexedDB.
 * Stores arrays of user IDs with composite ID (timeframe:reach).
 */
export class LocalActiveUsersService {
  private constructor() {}

  /**
   * Save or update active users
   * @param id - Composite ID: 'timeframe:reach' (e.g., 'today:all', 'month:friends')
   * @param userIds - Array of user IDs to store
   */
  static async upsert(id: string, userIds: Core.Pubky[]): Promise<void> {
    await Core.ActiveUsersModel.upsert({ id, userIds });
  }

  /**
   * Retrieve active users from cache
   * @param id - Composite ID
   * @returns ActiveUsersModel containing cached user IDs or null if not found
   */
  static async findById(id: string): Promise<Core.ActiveUsersModel | null> {
    return await Core.ActiveUsersModel.findById(id);
  }

  /**
   * Delete active users from cache
   * @param id - Composite ID to delete
   */
  static async deleteById(id: string): Promise<void> {
    await Core.ActiveUsersModel.deleteById(id);
  }

  /**
   * Clear all cached active users
   */
  static async clear(): Promise<void> {
    await Core.ActiveUsersModel.clear();
    Libs.Logger.info('Cleared all active users from cache');
  }
}
