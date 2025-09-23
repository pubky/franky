import * as Core from '@/core';

// User defaults
export const DEFAULT_USER_COUNTS: Omit<Core.NexusUserCounts, 'id'> = {
  tagged: 0,
  tags: 0,
  unique_tags: 0,
  posts: 0,
  replies: 0,
  following: 0,
  followers: 0,
  friends: 0,
  bookmarks: 0,
};
