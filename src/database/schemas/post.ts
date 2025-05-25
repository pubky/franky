import { type UserPK } from './user';

export type PostPK = `${UserPK}:${string}`;

export type PostKind = 'post' | 'reply' | 'repost';

export interface PostCounts {
  tags: number;
  unique_tags: number;
  replies: number;
  reposts: number;
}

export interface TagDetails {
  label: string;
  relationship: boolean;
  taggers: string[];
  taggers_count: number;
}

export interface PostRelationships {
  mentioned: string[];
  replied: string | null;
  repost: string | null;
}

export interface PostDetails {
  attachments: string[];
  author: UserPK;
  content: string;
  kind: PostKind;
  uri: string;
  indexed_at: number;
}

export interface Post {
  id: PostPK;
  counts: PostCounts;
  relationships: PostRelationships;
  details: PostDetails;
  tags: TagDetails[];
  bookmarked: boolean;
  indexed_at: number | null;
  updated_at: number;
  sync_status: string;
  sync_ttl: number;
}

export const DEFAULT_POST_COUNTS: PostCounts = {
  tags: 0,
  unique_tags: 0,
  replies: 0,
  reposts: 0,
};

export const DEFAULT_POST_RELATIONSHIPS: PostRelationships = {
  mentioned: [],
  replied: null,
  repost: null,
};

export const DEFAULT_SYNC_TTL = 3600000; // 1 hour in milliseconds 

// Schema for Dexie table
export const postTableSchema = 'id, details.author, details.kind, indexed_at, updated_at, sync_status, sync_ttl, bookmarked, *tags.label, relationships.replied, relationships.repost'; 