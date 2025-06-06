import { PostModelPK, SyncStatus, Timestamp, NexusPost } from '@/core';

export interface PostModelSchema extends NexusPost {
  id: PostModelPK;
  indexed_at: Timestamp | null; // timestamp from Nexus service
  created_at: Timestamp;
  sync_status: SyncStatus;
  sync_ttl: Timestamp;
}

// Schema for Dexie table
export const postTableSchema = '&id, indexed_at, created_at, sync_status, sync_ttl, bookmark';
