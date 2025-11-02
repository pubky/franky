export interface BookmarkModelSchema {
  id: string; // Composite key: pubky:postId
  bookmark_id: string;
  indexed_at: string;
}

// Primary and compound indexes for Dexie
export const bookmarkTableSchema = `
  &id
`;

