import { Pubky, BaseStreamModelSchema } from '@/core';

// Using string instead of UserStreamTypes enum to support composite IDs like 'userId:followers'
export type UserStreamModelSchema = BaseStreamModelSchema<string, Pubky>;

// Schema for Dexie table
export const userStreamTableSchema = '&id, *stream';
