import * as Core from '@/core';

/**
 * Timeline stream groups for invalidation
 * Grouped by reach type (following/friends) for efficient cache clearing
 *
 * Note: Only TIMELINE (recent) streams are cached locally.
 * POPULARITY (engagement) streams are not cached, so no need to invalidate them.
 */
export const FOLLOWING_TIMELINE_STREAMS = [
  Core.PostStreamTypes.TIMELINE_FOLLOWING_ALL,
  Core.PostStreamTypes.TIMELINE_FOLLOWING_SHORT,
  Core.PostStreamTypes.TIMELINE_FOLLOWING_LONG,
  Core.PostStreamTypes.TIMELINE_FOLLOWING_IMAGE,
  Core.PostStreamTypes.TIMELINE_FOLLOWING_VIDEO,
  Core.PostStreamTypes.TIMELINE_FOLLOWING_LINK,
  Core.PostStreamTypes.TIMELINE_FOLLOWING_FILE,
] as const;

export const FRIENDS_TIMELINE_STREAMS = [
  Core.PostStreamTypes.TIMELINE_FRIENDS_ALL,
  Core.PostStreamTypes.TIMELINE_FRIENDS_SHORT,
  Core.PostStreamTypes.TIMELINE_FRIENDS_LONG,
  Core.PostStreamTypes.TIMELINE_FRIENDS_IMAGE,
  Core.PostStreamTypes.TIMELINE_FRIENDS_VIDEO,
  Core.PostStreamTypes.TIMELINE_FRIENDS_LINK,
  Core.PostStreamTypes.TIMELINE_FRIENDS_FILE,
] as const;
