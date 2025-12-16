import * as Core from '@/core';
import * as Libs from '@/libs';

export class LocalModerationService {
  private constructor() {}

  static async setBlur(postId: string, blur: boolean): Promise<void> {
    try {
      if (blur) {
        await Core.ModerationModel.deleteById(postId);
      } else {
        await Core.ModerationModel.upsert({
          id: postId,
          created_at: Date.now(),
        });
      }
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.UPDATE_FAILED, 'Failed to set blur state', 500, {
        error,
        postId,
        blur,
      });
    }
  }

  static async isBlurred(postId: string): Promise<boolean> {
    try {
      const exists = await Core.ModerationModel.exists(postId);
      return !exists;
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, 'Failed to check blur state', 500, {
        error,
        postId,
      });
    }
  }

  static async bulkCheckBlurred(postIds: string[]): Promise<Set<string>> {
    if (postIds.length === 0) return new Set();

    try {
      const unblurredSet = await Core.ModerationModel.bulkExists(postIds);
      return new Set(postIds.filter((id) => !unblurredSet.has(id)));
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, 'Failed to bulk check blur state', 500, {
        error,
        count: postIds.length,
      });
    }
  }
}
