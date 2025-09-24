import * as Core from '@/core';

export interface PostCountsModelSchema extends Core.NexusPostCounts {
  id: string;
}

// Primary and compound indexes for Dexie
export const postCountsTableSchema = `
  &id,
  tags,
  unique_tags,
  replies,
  reposts
`;
