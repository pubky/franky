import * as Core from '@/core';
import * as Libs from '@/libs';

export class LocalModerationService {
  private constructor() {}

  /**
   * Sets the blur state for a moderated post.
   * Only updates posts that exist in the moderation table.
   */
  static async setBlur(postId: string, blur: boolean): Promise<void> {
    try {
      const record = await Core.ModerationModel.findById(postId);
      if (!record) {
        // Post is not moderated, nothing to update
        return;
      }
      await Core.ModerationModel.update(postId, { is_blurred: blur });
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.UPDATE_FAILED, 'Failed to set blur state', 500, {
        error,
        postId,
        blur,
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
}
