import { Pubky } from '@/core';
import { UserStreamTypes } from './userStream.types';

export interface UserStreamModelSchema {
  id: UserStreamTypes;
  users: Pubky[];
}

// Schema for Dexie table
export const userStreamTableSchema = '&id, *users';
