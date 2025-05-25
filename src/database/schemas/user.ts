export type UserPK = string;
export type Timestamp = number;
export type SyncStatus = 'local' | 'hs' | 'nexus';

export interface Link {
  url: string;
  title?: string;
}

export interface UserCounts {
  posts: number;
  replies: number;
  tagged: number;
  follower: number;
  following: number;
  friends: number;
  tags: number;
  unique_tags: number;
  bookmarks: number;
}

export interface UserDetails {
  name: string;
  bio: string;
  image: string;
  links: Link[];
  status: string;
}

export interface UserRelationship {
  followed_by: boolean;
  following: boolean;
  muted: boolean;
}

export interface TagDetails {
  label: string;
  relationship: boolean;
  taggers: string[];
  taggers_count: number;
}

export interface User {
  id: UserPK;
  details: UserDetails;
  counts: UserCounts;
  relationship: UserRelationship;
  followers: UserPK[];
  following: UserPK[];
  tags: TagDetails[];
  mutes: UserPK[];
  indexed_at: Timestamp | null;
  updated_at: Timestamp;
  sync_status: SyncStatus;
  sync_ttl: Timestamp;
}

// Default values for new entities
export const DEFAULT_USER_COUNTS: UserCounts = {
  posts: 0,
  replies: 0,
  tagged: 0,
  follower: 0,
  following: 0,
  friends: 0,
  tags: 0,
  unique_tags: 0,
  bookmarks: 0,
};

export const DEFAULT_USER_DETAILS: UserDetails = {
  name: '',
  bio: '',
  image: '',
  links: [],
  status: '',
};

export const DEFAULT_USER_RELATIONSHIP: UserRelationship = {
  followed_by: false,
  following: false,
  muted: false,
};

// One hour in milliseconds for sync_ttl default
export const DEFAULT_SYNC_TTL = 60 * 60 * 1000;

// Schema for Dexie table
export const userTableSchema = 'id, indexed_at, updated_at, sync_status, sync_ttl, *followers, *following, *mutes'; 