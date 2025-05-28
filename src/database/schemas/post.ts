import { PostPK, SyncStatus, Timestamp } from '../types';
import { NexusPost, NexusPostCounts, NexusPostDetails, NexusPostRelationships, NexusTag } from '@/services/nexus/types';

export type PostCounts = NexusPostCounts;
export type PostTag = NexusTag;
export type PostRelationships = NexusPostRelationships;
export type PostDetails = NexusPostDetails;

export interface Post extends NexusPost {
  id: PostPK;
  indexed_at: Timestamp | null; // timestamp from Nexus service
  created_at: Timestamp;
  sync_status: SyncStatus;
  sync_ttl: Timestamp;
}

// Schema for Dexie table
export const postTableSchema = `
  &id,
  details.author,
  details.kind,
  indexed_at,
  updated_at,
  sync_status,
  sync_ttl,
  bookmarked,
  [sync_status+sync_ttl],
  [details.author+details.kind],
  *tags.label,
  relationships.replied,
  relationships.reposted,
  [relationships.replied+details.author],
  [relationships.reposted+details.author]
`;
