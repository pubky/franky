import * as Core from '@/core';

export interface PostDetailsModelSchema extends Core.NexusPostDetails {
  id: string;
}

// Primary and compound indexes for Dexie
export const postDetailsTableSchema = `
  &id,
  content,
  indexed_at,
  author,
  kind,
  uri,
  attachments
`;
