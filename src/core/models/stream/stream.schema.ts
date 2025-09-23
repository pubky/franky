import * as Core from '@/core';

export interface StreamModelSchema {
  id: string;
  posts: Core.PostModelPK[];
  name: string | null;
}

// Schema for Dexie table
export const streamTableSchema = '&id, name, *posts';
