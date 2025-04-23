export type UserPK = string;
export type Timestamp = number;
export type SyncStatus = 'local' | 'hs' | 'nexus';

export interface Link {
  href: string;
  rel: string;
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

export interface IUserModel {
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