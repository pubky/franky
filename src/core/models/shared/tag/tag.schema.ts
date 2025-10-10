import type { NexusTag } from '@/core/services/nexus/nexus.types';

export interface TagCollectionModelSchema<Id> {
  id: Id;
  tags: NexusTag[];
}

// Schema for Dexie table
export const tagCollectionTableSchema = `
  &id,
  tags
`;
