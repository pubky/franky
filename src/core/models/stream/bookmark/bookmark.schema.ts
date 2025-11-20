export interface BookmarkModelSchema {
  id: string;
  created_at: number;
}

export const bookmarkTableSchema = `
  &id,
  created_at
`;
