import * as Core from '@/core';
import { shouldBlur } from './moderation.utils';

export class ModerationApplication {
  private constructor() {}

  static async setUnblur(postId: string): Promise<void> {
    return Core.LocalModerationService.setUnblur(postId);
  }

  static async enrichPostsWithModeration(
    posts: Core.PostDetailsModelSchema[],
    isBlurDisabledGlobally: boolean,
  ): Promise<Core.EnrichedPostDetails[]> {
    if (posts.length === 0) return [];

    const records = await Core.ModerationModel.findByIds(posts.map((p) => p.id));
    const recordMap = new Map(records.map((r) => [r.id, r]));

    return posts.map((post) => {
      const record = recordMap.get(post.id);
      return {
        ...post,
        is_moderated: !!record,
        is_blurred: record ? shouldBlur(true, record.is_blurred, isBlurDisabledGlobally) : false,
      };
    });
  }
}
