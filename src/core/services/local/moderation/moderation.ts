import * as Core from '@/core';
import * as Libs from '@/libs';

export class LocalModerationService {
  private constructor() {}

  static async setUnblur(postId: string): Promise<void> {
    try {
      const record = await Core.ModerationModel.findById(postId);
      if (!record) {
        return;
      }
      await Core.ModerationModel.update(postId, { is_blurred: false });
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.UPDATE_FAILED, 'Failed to unblur post', 500, {
        error,
        postId,
      });
    }
  }

  /**
   * Gets the moderation state for a post.
   * Returns null if the post is not moderated.
   */
  static async getModerationRecord(postId: string): Promise<Core.ModerationModelSchema | null> {
    try {
      const record = await Core.ModerationModel.findById(postId);
      return record ?? null;
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, 'Failed to get moderation record', 500, {
        error,
        postId,
      });
    }
  }

  /**
   * Gets the moderation records for multiple posts.
   */
  static async getModerationRecords(postIds: string[]): Promise<Core.ModerationModelSchema[]> {
    try {
      return await Core.ModerationModel.findByIds(postIds);
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, 'Failed to get moderation records', 500, {
        error,
        postIds,
      });
    }
  }
}
