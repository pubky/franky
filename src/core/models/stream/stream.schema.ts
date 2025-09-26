export interface StreamModelSchema {
  id: string;
  posts: string[];
  name: string | null;
}

// Schema for Dexie table
export const streamTableSchema = '&id, name, *posts';
