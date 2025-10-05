import { Pubky, BaseStreamModelSchema } from '@/core';
import { UserStreamTypes } from './userStream.types';

export type UserStreamModelSchema = BaseStreamModelSchema<UserStreamTypes, Pubky>;

// Schema for Dexie table
export const userStreamTableSchema = '&id, *users';
