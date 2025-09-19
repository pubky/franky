import { type UserModelPK, type Timestamp, type PostModelPK, type TagModel } from '@/core';

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
  id: UserModelPK;
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

export interface NexusTag {
  label: string;
  taggers: UserModelPK[];
  taggers_count: number;
  relationship: boolean;
}

export interface NexusUser {
  details: NexusUserDetails;
  counts: NexusUserCounts;
  tags: NexusTag[];
  relationship: NexusUserRelationship;
}

// Post types
export interface NexusPostDetails {
  content: string;
  id: PostModelPK;
  indexed_at: number;
  author: UserModelPK;
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

export interface NexusPostRelationships {
  replied: string | null;
  reposted: string | null;
  mentioned: UserModelPK[];
}

export interface NexusPost {
  details: NexusPostDetails;
  counts: NexusPostCounts;
  tags: TagModel[];
  relationships: NexusPostRelationships;
  bookmark: NexusBookmark | null;
}

export interface NexusBootstrapList {
  stream: string[];
  influencers: UserModelPK[];
  recommended: UserModelPK[];
}
