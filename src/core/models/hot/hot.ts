import { Table } from 'dexie';
import { db } from '@/core/database';
import { HotTagsModelSchema } from './hot.schema';
import { NexusHotTag } from '@/core/services/nexus/nexus.types';
import * as Libs from '@/libs';

/**
 * Hot Tags Model
 * Manages hot/trending tags cache in IndexedDB
 */
export class HotTagsModel {
  static table: Table<HotTagsModelSchema> = db.table('hot_tags');

  id: string;
  tags: NexusHotTag[];
  cached_at: number;

  constructor(data: HotTagsModelSchema) {
    this.id = data.id;
    this.tags = data.tags;
    this.cached_at = data.cached_at;
  }

  /**
   * Save or update hot tags
   * @param id - Composite ID (timeframe:reach)
   * @param tags - Array of hot tags
   */
  static async upsert(id: string, tags: NexusHotTag[]): Promise<HotTagsModelSchema> {
    try {
      const data: HotTagsModelSchema = {
        id,
        tags,
        cached_at: Date.now(),
      };
      await this.table.put(data);
      Libs.Logger.debug('Hot tags upserted successfully', { id, count: tags.length });
      return data;
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.UPSERT_FAILED,
        `Failed to upsert hot tags with ID: ${id}`,
        500,
        { error, id, tagsCount: tags.length },
      );
    }
  }

  /**
   * Find hot tags by ID
   * @param id - Composite ID (timeframe:reach)
   */
  static async findById(id: string): Promise<HotTagsModel | null> {
    try {
      const data = await this.table.get(id);
      if (!data) {
        return null;
      }
      return new HotTagsModel(data);
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.FIND_FAILED, `Failed to find hot tags: ${id}`, 500, {
        error,
        id,
      });
    }
  }

  /**
   * Delete hot tags by ID
   * @param id - Composite ID (timeframe:reach)
   */
  static async deleteById(id: string): Promise<void> {
    try {
      await this.table.delete(id);
      Libs.Logger.debug('Hot tags deleted', { id });
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.DELETE_FAILED,
        `Failed to delete hot tags with ID: ${id}`,
        500,
        { error, id },
      );
    }
  }

  /**
   * Clear all hot tags
   */
  static async clear(): Promise<void> {
    try {
      await this.table.clear();
      Libs.Logger.debug('All hot tags cleared');
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.DELETE_FAILED, 'Failed to clear hot tags table', 500, {
        error,
      });
    }
  }
}
