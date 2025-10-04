import { PostStreamTypes } from './postStream.types';

export interface PostStreamModelSchema {
  id: PostStreamTypes;
  posts: string[];
  name: string | null;
}

// Schema for Dexie table
export const postStreamTableSchema = '&id, name, *posts';
