import * as Core from '@/core';

export class ModerationController {
  private constructor() {}

  private static get isBlurDisabledGlobally(): boolean {
    return !Core.useSettingsStore.getState().privacy.blurCensored;
  }

  /**
   * Unblur a moderated item (post or profile).
   */
  static async unblur(id: string): Promise<void> {
    return Core.ModerationApplication.setUnblur(id);
  }

  static async enrichPosts(posts: Core.PostDetailsModelSchema[]): Promise<Core.EnrichedPostDetails[]> {
    return Core.ModerationApplication.enrichPostsWithModeration(posts, this.isBlurDisabledGlobally);
  }

  static async enrichUsers(users: Core.UserDetailsModelSchema[]): Promise<Core.EnrichedUserDetails[]> {
    return Core.ModerationApplication.enrichUsersWithModeration(users, this.isBlurDisabledGlobally);
  }

  /**
   * Get moderation status for a single item.
   */
  static async getModerationStatus(
    id: string,
    type: Core.ModerationType,
  ): Promise<{ is_moderated: boolean; is_blurred: boolean }> {
    return Core.ModerationApplication.getModerationStatus(id, type, this.isBlurDisabledGlobally);
  }
}
