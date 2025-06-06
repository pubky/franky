import { SYNC_TTL } from '@/config';
import { NexusPostCounts, NexusPostRelationships, SyncStatus } from '@/core';

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

export const DEFAULT_NEW_POST = {
  counts: DEFAULT_POST_COUNTS,
  relationships: DEFAULT_POST_RELATIONSHIPS,
  tags: [],
  bookmark: null,
  indexed_at: null,
  updated_at: Date.now(),
  sync_status: 'local' as SyncStatus,
  sync_ttl: Date.now() + SYNC_TTL,
};

export const DEFAULT_POST_DETAILS = {
  content: '',
  id: '',
  indexed_at: Date.now(),
  kind: 'short',
  uri: '',
  attachments: [],
};
