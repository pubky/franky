import * as Core from '@/core';

export type PostDetailsModelSchema = Core.NexusPostDetails;

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
