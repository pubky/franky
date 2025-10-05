import { TagStreamTypes } from './tagStream.types';
import { NexusHotTag } from '@/core/services/nexus/nexus.types';

export interface TagStreamModelSchema {
  id: TagStreamTypes;
  tags: NexusHotTag[];
}

// Schema for Dexie table
export const tagStreamTableSchema = '&id, *tags';
