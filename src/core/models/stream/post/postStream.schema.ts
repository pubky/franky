import { PostStreamTypes } from './postStream.types';
import { BaseStreamModelSchema } from '@/core/models/shared/stream/stream.type';

export interface PostStreamModelSchema extends BaseStreamModelSchema<PostStreamTypes, string> {
  name: string | undefined;
}

// Schema for Dexie table
export const postStreamTableSchema = '&id, name, *posts';
