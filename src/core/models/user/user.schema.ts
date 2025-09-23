import { NexusUser, SyncStatus, Timestamp, Pubky } from '@/core';

export interface UserModelSchema extends NexusUser {
  id: Pubky;
  following: Pubky[];
  followers: Pubky[];
  muted: Pubky[];
  indexed_at: Timestamp | null;
  updated_at: Timestamp;
  sync_status: SyncStatus;
  sync_ttl: Timestamp;
}

// Primary and compound indexes for Dexie
export const userTableSchema = `
  &id,
  indexed_at,
  created_at,
  sync_status,
  sync_ttl,
  details.name,
  [sync_status+sync_ttl],
  *followers,
  *following,
  *mutes
`;
