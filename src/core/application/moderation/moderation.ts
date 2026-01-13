import * as Core from '@/core';
import { shouldBlur } from './moderation.utils';

export class ModerationApplication {
  private constructor() {}

  /**
   * Sets an item as un-blurred by the user.
   */
  static async setUnBlur(id: string): Promise<void> {
    return Core.LocalModerationService.setUnBlur(id);
  }

  /**
   * Enriches items with moderation status.
   * Generic method that works for both posts and users.
   */
  private static enrichWithModeration<T extends { id: string }>(
    items: T[],
    recordMap: Map<string, Core.ModerationModelSchema>,
    isBlurDisabledGlobally: boolean,
  ): (T & { is_moderated: boolean; is_blurred: boolean })[] {
    return items.map((item) => {
      const record = recordMap.get(item.id);
      return {
        ...item,
        is_moderated: !!record,
        is_blurred: record ? shouldBlur(record.is_blurred, isBlurDisabledGlobally) : false,
      };
    });
  }

  static async enrichPostsWithModeration(
    posts: Core.PostDetailsModelSchema[],
    isBlurDisabledGlobally: boolean,
  ): Promise<Core.EnrichedPostDetails[]> {
    if (posts.length === 0) return [];

    const records = await Core.LocalModerationService.getModerationRecords(
      posts.map((p) => p.id),
      Core.ModerationType.POST,
    );
    const recordMap = new Map(records.map((r) => [r.id, r]));

    return this.enrichWithModeration(posts, recordMap, isBlurDisabledGlobally);
  }

  static async enrichUsersWithModeration(
    users: Core.UserDetailsModelSchema[],
    isBlurDisabledGlobally: boolean,
  ): Promise<Core.EnrichedUserDetails[]> {
    if (users.length === 0) return [];

    const records = await Core.LocalModerationService.getModerationRecords(
      users.map((u) => u.id),
      Core.ModerationType.PROFILE,
    );
    const recordMap = new Map(records.map((r) => [r.id, r]));

    return this.enrichWithModeration(users, recordMap, isBlurDisabledGlobally);
  }

  /**
   * Check moderation status for a single item.
   */
  static async getModerationStatus(
    id: string,
    type: Core.ModerationType,
    isBlurDisabledGlobally: boolean,
  ): Promise<{ is_moderated: boolean; is_blurred: boolean }> {
    const record = await Core.LocalModerationService.getModerationRecord(id, type);
    return {
      is_moderated: !!record,
      is_blurred: record ? shouldBlur(record.is_blurred, isBlurDisabledGlobally) : false,
    };
  }
}
