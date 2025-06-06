import { NexusPostCounts, NexusPostRelationships } from '@/core';

// Post defaults
export const DEFAULT_POST_COUNTS: NexusPostCounts = {
  tags: 0,
  unique_tags: 0,
  replies: 0,
  reposts: 0,
};

export const DEFAULT_POST_RELATIONSHIPS: NexusPostRelationships = {
  mentioned: [],
  replied: null,
  reposted: null,
};
