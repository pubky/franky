export interface PostStreamModelSchema {
  id: string;
  posts: string[];
  name: string | null;
}

// Schema for Dexie table
export const postStreamTableSchema = '&id, name, *posts';
