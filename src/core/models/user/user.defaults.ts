import { SYNC_TTL } from '@/config';
import { SyncStatus, NexusUserCounts, NexusUserDetails, NexusUserRelationship } from '@/core';

// User defaults
export const DEFAULT_USER_COUNTS: NexusUserCounts = {
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

export const DEFAULT_USER_DETAILS: Omit<NexusUserDetails, 'id'> = {
  name: '',
  bio: '',
  image: null,
  indexed_at: Date.now(),
  links: null,
  status: null,
};

export const DEFAULT_USER_RELATIONSHIP: NexusUserRelationship = {
  followed_by: false,
  following: false,
  muted: false,
};

export const DEFAULT_NEW_USER = {
  counts: DEFAULT_USER_COUNTS,
  relationship: DEFAULT_USER_RELATIONSHIP,
  tags: [],
  following: [],
  followers: [],
  muted: [],
  indexed_at: null,
  updated_at: Date.now(),
  sync_status: 'local' as SyncStatus,
  sync_ttl: Date.now() + SYNC_TTL,
};
