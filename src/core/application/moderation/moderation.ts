import * as Core from '@/core';
import { detectModeration, shouldBlur } from './moderation.utils';

export class ModerationApplication {
  private constructor() {}

  static async setBlur(postId: string, blur: boolean): Promise<void> {
    return Core.LocalModerationService.setBlur(postId, blur);
  }

  static async enrichPostWithModeration(post: Core.PostDetailsModelSchema): Promise<Core.EnrichedPostDetails> {
    const moderationState = await this.getModerationState(post.id);
    return {
      ...post,
      ...moderationState,
    };
  }

  static async enrichPostsWithModeration(posts: Core.PostDetailsModelSchema[]): Promise<Core.EnrichedPostDetails[]> {
    return Promise.all(posts.map((post) => this.enrichPostWithModeration(post)));
  }

  static async getModerationState(postId: string): Promise<Core.ModerationState> {
    const isBlurDisabledGlobally = !Core.useSettingsStore.getState().privacy.blurCensored;

    const [tags, isBlurred] = await Promise.all([
      Core.PostTagsModel.table.get(postId),
      Core.LocalModerationService.isBlurred(postId),
    ]);

    const isModerated = detectModeration(tags);

    return {
      is_moderated: isModerated,
      is_blurred: shouldBlur(isModerated, isBlurred, isBlurDisabledGlobally),
    };
  }
}
