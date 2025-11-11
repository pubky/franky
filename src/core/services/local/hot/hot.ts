import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * Local Hot Service
 *
 * Manages hot tags storage in IndexedDB.
 * Stores arrays of NexusHotTag objects with composite ID (timeframe:reach).
 */
export class LocalHotService {
  private constructor() {}

  /**
   * Save or update hot tags
   * @param id - Composite ID: 'timeframe:reach' (e.g., 'today:all', 'month:friends')
   * @param tags - Array of hot tags to store
   */
  static async upsert(id: string, tags: Core.NexusHotTag[]): Promise<void> {
    try {
      await Core.HotTagsModel.upsert(id, tags);
    } catch (error) {
      Libs.Logger.error('Failed to upsert hot tags', { id, error });
      throw error;
    }
  }

  /**
   * Retrieve hot tags from cache
   * @param id - Composite ID
   * @returns HotTagsModel containing cached hot tags or null if not found
   */
  static async findById(id: string): Promise<Core.HotTagsModel | null> {
    try {
      return await Core.HotTagsModel.findById(id);
    } catch (error) {
      Libs.Logger.error('Failed to find hot tags', { id, error });
      throw error;
    }
  }

  /**
   * Delete hot tags from cache
   * @param id - Composite ID to delete
   */
  static async deleteById(id: string): Promise<void> {
    try {
      await Core.HotTagsModel.deleteById(id);
    } catch (error) {
      Libs.Logger.error('Failed to delete hot tags', { id, error });
      throw error;
    }
  }

  /**
   * Clear all cached hot tags
   */
  static async clear(): Promise<void> {
    try {
      await Core.HotTagsModel.clear();
      Libs.Logger.info('Cleared all hot tags from cache');
    } catch (error) {
      Libs.Logger.error('Failed to clear hot tags', { error });
      throw error;
    }
  }
}
