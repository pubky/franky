import * as Core from '@/core';
import * as Libs from '@/libs';

export class LocalModerationService {
  private constructor() {}

  /**
   * Sets an item as un-blurred by the user.
   */
  static async setUnBlur(id: string): Promise<void> {
    try {
      const record = await Core.ModerationModel.findById(id);
      if (!record) {
        return;
      }
      await Core.ModerationModel.update(id, { is_blurred: false });
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.UPDATE_FAILED, 'Failed to unblur item', 500, {
        error,
        id,
      });
    }
  }

  /**
   * Gets the moderation state for an item.
   * Returns null if the item is not moderated.
   * Optionally filters by type.
   */
  static async getModerationRecord(id: string, type?: Core.ModerationType): Promise<Core.ModerationModelSchema | null> {
    try {
      const record = await Core.ModerationModel.findById(id);
      if (!record) return null;
      if (type && record.type !== type) return null;
      return record;
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, 'Failed to get moderation record', 500, {
        error,
        id,
        type,
      });
    }
  }

  /**
   * Gets the moderation records for multiple items.
   * Optionally filters by type.
   */
  static async getModerationRecords(ids: string[], type?: Core.ModerationType): Promise<Core.ModerationModelSchema[]> {
    try {
      const records = await Core.ModerationModel.findByIds(ids);
      if (type) {
        return records.filter((r) => r.type === type);
      }
      return records;
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, 'Failed to get moderation records', 500, {
        error,
        ids,
        type,
      });
    }
  }
}
