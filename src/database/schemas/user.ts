import { SyncStatus, Timestamp, UserPK } from '../types';
import {
  NexusUser,
  NexusUserCounts,
  NexusUserDetails,
  NexusUserRelationship,
  NexusUserTag,
} from '@/services/nexus/types';

export type UserCounts = NexusUserCounts;
export type UserDetails = NexusUserDetails;
export type UserRelationship = NexusUserRelationship;
export type TagDetails = NexusUserTag;

export interface User extends NexusUser {
  id: UserPK;
  followers: UserPK[];
  following: UserPK[];
  mutes: UserPK[];

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
