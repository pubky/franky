import * as Core from '@/core';

export enum STREAM_PREFIX {
  POSTS = 'stream/posts',
  POSTS_BY_IDS = 'stream/posts/by_ids',
}

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

export type TStreamAuthorId = {
  author_id: Core.Pubky;
};

// Base parameters that are always optional
export type TStreamBase = Core.TPaginationParams &
  Core.TPaginationRangeParams & {
    // The content viewer (for personalization like bookmarks, relationships)
    viewer_id?: Core.Pubky;
    sorting?: Core.StreamSorting;
    order?: StreamOrder;
    tags?: string[]; // Max 5 tags
    kind?: StreamKind;
  };

// Specific parameter types for each source
export type TStreamWithObserverParams = TStreamBase & {
  // The user whose content stream we're accessing (e.g., "alice_pubky" for Alice's following feed)
  observer_id: Core.Pubky;
};

export type TStreamPostRepliesParams = TStreamBase &
  TStreamAuthorId & {
    post_id: string;
  };

export type TStreamAuthorParams = TStreamBase & TStreamAuthorId;

export type TStreamAuthorRepliesParams = TStreamBase & TStreamAuthorId;

export type TStreamAllParams = TStreamBase;

// Posts by IDs endpoint
export type TStreamPostsByIdsParams = {
  post_ids: string[]; // Required array of post IDs
  viewer_id?: Core.Pubky; // Optional viewer ID
};

export type TStreamQueryParams =
  | Core.TStreamWithObserverParams
  | Core.TStreamPostRepliesParams
  | Core.TStreamAuthorParams
  | Core.TStreamAuthorRepliesParams
  | Core.TStreamAllParams
  | Core.TStreamPostsByIdsParams;
