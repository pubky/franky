import * as Core from '@/core';

// Post counts defaults
export const DEFAULT_POST_COUNTS: Omit<Core.NexusPostCounts, 'id'> = {
  tags: 0,
  unique_tags: 0,
  replies: 0,
  reposts: 0,
};
