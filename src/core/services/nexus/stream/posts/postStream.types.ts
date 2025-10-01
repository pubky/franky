import * as Core from '@/core';

export enum StreamSource {
  ALL = 'all',
  FOLLOWING = 'following',
  FOLLOWERS = 'followers',
  FRIENDS = 'friends',
  BOOKMARKS = 'bookmarks',
  REPLIES = 'replies',
  AUTHOR = 'author',
  AUTHOR_REPLIES = 'author_replies',
}

export enum StreamKind {
  SHORT = 'short',
  LONG = 'long',
  IMAGE = 'image',
  VIDEO = 'video',
  LINK = 'link',
  FILE = 'file',
}

export enum StreamOrder {
  ASCENDING = 'ascending',
  DESCENDING = 'descending',
}

// Base parameters that are always optional
export type TStreamBase = {
  // The content viewer (for personalization like bookmarks, relationships)
  viewer_id?: Core.Pubky;
  sorting?: Core.StreamSorting;
  order?: StreamOrder;
  tags?: string[]; // Max 5 tags
  kind?: StreamKind;
  skip?: number;
  limit?: number;
  start?: number;
  end?: number;
};

// Specific parameter types for each source
export type TStreamWithObserverParams = TStreamBase & {
  // The user whose content stream we're accessing (e.g., "alice_pubky" for Alice's following feed)
  observer_id: Core.Pubky;
};

export type TStreamPostRepliesParams = TStreamBase & {
  author_id: Core.Pubky;
  post_id: Core.Pubky;
};

export type TStreamAuthorParams = TStreamBase & {
  author_id: Core.Pubky;
};

export type TStreamAuthorRepliesParams = TStreamBase & {
  author_id: Core.Pubky;
};

export type TStreamAllParams = TStreamBase;

// Posts by IDs endpoint
export type TStreamPostsByIdsParams = {
  post_ids: string[]; // Required array of post IDs
  viewer_id?: Core.Pubky; // Optional viewer ID
};
