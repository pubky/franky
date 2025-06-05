import { PostCounts, PostRelationships } from '@/core';

// Post defaults
export const DEFAULT_POST_COUNTS: PostCounts = {
  tags: 0,
  unique_tags: 0,
  replies: 0,
  reposts: 0,
};

export const DEFAULT_POST_RELATIONSHIPS: PostRelationships = {
  mentioned: [],
  replied: null,
  reposted: null,
};
