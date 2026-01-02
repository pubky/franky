import * as Core from '@/core';

export class ModerationController {
  private constructor() {}

  static async unblurPost(postId: string): Promise<void> {
    return Core.ModerationApplication.setUnblur(postId);
  }

  static async enrichPosts(posts: Core.PostDetailsModelSchema[]): Promise<Core.EnrichedPostDetails[]> {
    const isBlurDisabledGlobally = !Core.useSettingsStore.getState().privacy.blurCensored;
    return Core.ModerationApplication.enrichPostsWithModeration(posts, isBlurDisabledGlobally);
  }
}
