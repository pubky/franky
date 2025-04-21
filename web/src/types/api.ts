export type PubkyAppPostKind = 'short' | 'long' | 'image' | 'video' | 'link' | 'file';
export type StreamSorting = 'timeline' | 'total_engagement';
export type StreamSource = 
  | { source: 'post_replies'; author_id: string; post_id: string }
  | { source: 'following'; observer_id: string }
  | { source: 'followers'; observer_id: string }
  | { source: 'friends'; observer_id: string }
  | { source: 'bookmarks'; observer_id: string }
  | { source: 'author'; author_id: string }
  | { source: 'author_replies'; author_id: string }
  | { source: 'all' };

export type UserStreamSource = 
  | 'followers'
  | 'following'
  | 'friends'
  | 'muted'
  | 'most_followed'
  | 'influencers'
  | 'recommended'
  | 'post_replies';

export type PostChangedSource = 
  | 'reply'
  | 'repost'
  | 'bookmark'
  | 'reply_parent'
  | 'repost_embed'
  | 'tagged_post';

export interface Bookmark {
  id: string;
  indexed_at: number;
}

export interface FileDetails {
  content_type: string;
  created_at: number;
  id: string;
  indexed_at: number;
  metadata: Record<string, string> | null;
  name: string;
  owner_id: string;
  size: number;
  src: string;
  uri: string;
  urls: FileUrls;
}

export interface FileUrls {
  feed: string | null;
  main: string;
  small: string | null;
}

export interface FilesByIdsBody {
  uris: string[];
}

export interface HotTag {
  label: string;
  taggers_id: string[];
  tagged_count: number;
  taggers_count: number;
}

export interface Notification {
  timestamp: number;
  body: NotificationBody;
}

export type NotificationBody = 
  | { type: 'follow'; followed_by: string }
  | { type: 'new_friend'; followed_by: string }
  | { type: 'lost_friend'; unfollowed_by: string }
  | { type: 'tag_post'; tagged_by: string; tag_label: string; post_uri: string }
  | { type: 'tag_profile'; tagged_by: string; tag_label: string }
  | { type: 'reply'; replied_by: string; parent_post_uri: string; reply_uri: string }
  | { type: 'repost'; reposted_by: string; embed_uri: string; repost_uri: string }
  | { type: 'mention'; mentioned_by: string; post_uri: string }
  | { type: 'post_deleted'; deleted_by: string; deleted_uri: string; linked_uri: string; delete_source: PostChangedSource }
  | { type: 'post_edited'; edited_by: string; edited_uri: string; linked_uri: string; edit_source: PostChangedSource };

export interface PostCounts {
  tags: number;
  unique_tags: number;
  replies: number;
  reposts: number;
}

export interface PostDetails {
  attachments: string[] | null;
  author: string;
  content: string;
  id: string;
  indexed_at: number;
  kind: PubkyAppPostKind;
  uri: string;
}

export interface PostRelationships {
  mentioned: string[];
  replied: string | null;
  reposted: string | null;
}

export interface PostView {
  bookmark: Bookmark | null;
  counts: PostCounts;
  details: PostDetails;
  relationships: PostRelationships;
  tags: TagDetails[];
}

export interface PubkyAppUserLink {
  title: string;
  url: string;
}

export interface Relationship {
  following: boolean;
  followed_by: boolean;
  muted: boolean;
}

export interface ServerInfo {
  description: string;
  homepage: string;
  license: string;
  name: string;
  repository: string;
  version: string;
  commit_hash: string;
  last_index_snapshot: string;
  base_file_url: string;
}

export interface TagDetails {
  label: string;
  relationship: boolean;
  taggers: string[];
  taggers_count: number;
}

export interface TagSearch {
  post_key: string;
  score: number;
}

export interface TaggersInfoDTO {
  users: string[];
  relationship: boolean;
}

export interface UserCounts {
  tagged: number;
  tags: number;
  unique_tags: number;
  posts: number;
  replies: number;
  following: number;
  followers: number;
  friends: number;
  bookmarks: number;
}

export interface UserDetails {
  bio: string | null;
  id: string;
  image: string | null;
  indexed_at: number;
  links: PubkyAppUserLink[] | null;
  name: string;
  status: string | null;
}

export interface UserStreamByIdsRequest {
  user_ids: string[];
  depth?: number | null;
  viewer_id?: string | null;
}

export interface UserView {
  counts: UserCounts;
  details: UserDetails;
  relationship: Relationship;
  tags: TagDetails[];
}

export type UserSearch = string[];
export type Followers = string[];
export type Following = string[];
export type Friends = string[];
export type Muted = string[];
export type PostStream = PostView[];
export type UserStream = UserView[];
export type HotTags = HotTag[];
export type TagPost = string[];
export type Taggers = string[];

export type Vec = string[];