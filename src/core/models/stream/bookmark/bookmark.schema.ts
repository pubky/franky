import * as Core from '@/core';

// Bookmark represents a user bookmarking a post
// The id is a composite: userId:postId
export interface BookmarkModelSchema {
  id: string; // Primary key
  userId: Core.Pubky; // Stores who created the bookmark
  postId: string; // Stores what post was bookmarked
  created_at: number;
  updated_at: number;
}

// Primary and compound indexes for Dexie
export const bookmarkTableSchema = `
  &id,
  userId,
  postId,
  created_at
`;
