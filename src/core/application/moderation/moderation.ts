import * as Core from '@/core';
import { shouldBlur } from './moderation.utils';

export class ModerationApplication {
  private constructor() {}

  static async setBlur(postId: string, blur: boolean): Promise<void> {
    return Core.LocalModerationService.setBlur(postId, blur);
  }

  /**
   * Enriches a post with moderation state.
   * A post is moderated if it exists in the moderation table (stored during sync).
   * The blur state respects both the stored value and the global setting.
   */
  static async enrichPostWithModeration(post: Core.PostDetailsModelSchema): Promise<Core.EnrichedPostDetails> {
    const isBlurDisabledGlobally = !Core.useSettingsStore.getState().privacy.blurCensored;
    const record = await Core.LocalModerationService.getModerationRecord(post.id);

    if (!record) {
      return {
        ...post,
        is_moderated: false,
        is_blurred: false,
      };
    }

    return {
      ...post,
      is_moderated: true,
      is_blurred: shouldBlur(true, record.is_blurred, isBlurDisabledGlobally),
    };
  }

  static async enrichPostsWithModeration(posts: Core.PostDetailsModelSchema[]): Promise<Core.EnrichedPostDetails[]> {
    return Promise.all(posts.map((post) => this.enrichPostWithModeration(post)));
  }
}
