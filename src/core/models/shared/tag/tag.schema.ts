import * as Core from '@/core';

export interface TagCollectionModelSchema<Id> {
  id: Id;
  tags: Core.NexusTag[];
}

// Schema for Dexie table
export const tagCollectionTableSchema = `
  &id,
  tags
`;
