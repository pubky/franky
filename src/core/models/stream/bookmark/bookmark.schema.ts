// Bookmark represents a user bookmarking a post
// Similar to notifications, stores only data for the current user
export interface BookmarkModelSchema {
  id: string; // Composite post ID (authorId:postId)
  created_at: number;
}

// Primary and compound indexes for Dexie
export const bookmarkTableSchema = `
  &id,
  created_at
`;
