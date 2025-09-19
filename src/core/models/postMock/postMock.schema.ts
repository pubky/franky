import { PostMock } from '@/core';

// Use PostMock directly as the schema since it has all needed fields
export type PostMockSchema = PostMock;

// Schema for Dexie table - define indexes for efficient querying
export const postMockTableSchema = '&id, createdAt, text';
