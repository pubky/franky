import * as Core from '@/core';

// Post Stream ID Pattern: sorting:source:kind
// - SORTING: timeline (recent), total_engagement (popularity)
// - SOURCE: all, following, friends, me, bookmarks, post_replies, author, author_replies
// - KIND: all, short (posts), long (articles), image, video, link, file
//
// Dynamic Post Reply Stream ID Pattern: postReplies:compositePostId
// - compositePostId format: author:postId (e.g., "did:key:abc123:post456")
// - Example: "postReplies:did:key:abc123:post456"
export enum PostStreamTypes {
  // ============================================
  // TIMELINE (Recent) - ALL Sources
  // ============================================
  TIMELINE_ALL_ALL = 'timeline:all:all',
  TIMELINE_ALL_SHORT = 'timeline:all:short',
  TIMELINE_ALL_LONG = 'timeline:all:long',
  TIMELINE_ALL_IMAGE = 'timeline:all:image',
  TIMELINE_ALL_VIDEO = 'timeline:all:video',
  TIMELINE_ALL_LINK = 'timeline:all:link',
  TIMELINE_ALL_FILE = 'timeline:all:file',

  // ============================================
  // TIMELINE (Recent) - FOLLOWING Source
  // ============================================
  TIMELINE_FOLLOWING_ALL = 'timeline:following:all',
  TIMELINE_FOLLOWING_SHORT = 'timeline:following:short',
  TIMELINE_FOLLOWING_LONG = 'timeline:following:long',
  TIMELINE_FOLLOWING_IMAGE = 'timeline:following:image',
  TIMELINE_FOLLOWING_VIDEO = 'timeline:following:video',
  TIMELINE_FOLLOWING_LINK = 'timeline:following:link',
  TIMELINE_FOLLOWING_FILE = 'timeline:following:file',

  // ============================================
  // TIMELINE (Recent) - FRIENDS Source
  // ============================================
  TIMELINE_FRIENDS_ALL = 'timeline:friends:all',
  TIMELINE_FRIENDS_SHORT = 'timeline:friends:short',
  TIMELINE_FRIENDS_LONG = 'timeline:friends:long',
  TIMELINE_FRIENDS_IMAGE = 'timeline:friends:image',
  TIMELINE_FRIENDS_VIDEO = 'timeline:friends:video',
  TIMELINE_FRIENDS_LINK = 'timeline:friends:link',
  TIMELINE_FRIENDS_FILE = 'timeline:friends:file',
}

export type ReplyStreamCompositeId = `${Core.StreamSource.REPLIES}:${string}`;
export type AuthorStreamCompositeId = `${Core.StreamSource.AUTHOR}:${string}`;
export type AuthorRepliesStreamCompositeId = `${Core.StreamSource.AUTHOR_REPLIES}:${string}`;

export function buildPostReplyStreamId(compositePostId: string): ReplyStreamCompositeId {
  return `${Core.StreamSource.REPLIES}:${compositePostId}`;
}

export type PostStreamId = PostStreamTypes | ReplyStreamCompositeId | AuthorStreamCompositeId | AuthorRepliesStreamCompositeId;
