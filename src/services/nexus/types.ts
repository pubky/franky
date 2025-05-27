import { type UserPK, type PostPK, type Timestamp } from '@/database/types';

// Common types

export type NexusPostKind = 'short' | 'long' | 'repost' | 'reply' | 'link';

export interface NexusBookmark {
  created_at: number;
  updated_at: number;
}

export interface NexusUserLink {
  title: string;
  url: string;
}

// User types
export interface NexusUserDetails {
  name: string;
  bio: string;
  id: UserPK;
  links: NexusUserLink[] | null;
  status: string | null;
  image: string | null;
  indexed_at: Timestamp;
}

export interface NexusUserCounts {
  tagged: number; // the number of tags assign by this user to other entities ('users' or 'posts')
  tags: number; // the number of tags received by this user from other users
  unique_tags: number; // the number of unique tags received by this user from other users (distinct)
  posts: number;
  replies: number;
  following: number;
  followers: number;
  friends: number;
  bookmarks: number;
}

export interface NexusUserRelationship {
  following: boolean;
  followed_by: boolean;
  muted: boolean;
}

export interface NexusUserTag {
  label: string;
  taggers: UserPK[];
  taggers_count: number;
  relationship: boolean;
}

export interface NexusUser {
  details: NexusUserDetails;
  counts: NexusUserCounts;
  tags: NexusUserTag[];
  relationship: NexusUserRelationship;
}

// Post types
export interface NexusPostDetails {
  content: string;
  id: PostPK;
  indexed_at: number;
  author: UserPK;
  kind: NexusPostKind;
  uri: string;
  attachments: string[] | null;
}

export interface NexusPostCounts {
  tags: number;
  unique_tags: number;
  replies: number;
  reposts: number;
}

export interface NexusPostTag {
  label: string;
  taggers: UserPK[];
  taggers_count: number;
  relationship: boolean;
}

export interface NexusPostRelationships {
  replied: string | null;
  reposted: string | null;
  mentioned: UserPK[];
}

export interface NexusPost {
  details: NexusPostDetails;
  counts: NexusPostCounts;
  tags: NexusPostTag[];
  relationships: NexusPostRelationships;
  bookmark: NexusBookmark | null;
}

export interface NexusList {
  stream: string[];
  influencers: UserPK[];
  recommended: UserPK[];
}

export interface NexusBootstrapResponse {
  users: NexusUser[];
  posts: NexusPost[];
  list: NexusList;
}
