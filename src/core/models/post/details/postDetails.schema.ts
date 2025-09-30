import * as Core from '@/core';

// The id of the model is composed of the author and the id
// authorId:postId
export type PostDetailsModelSchema = Omit<Core.NexusPostDetails, 'author'>;

// Primary and compound indexes for Dexie
export const postDetailsTableSchema = `
  &id,
  content,
  indexed_at,
  kind,
  uri,
  attachments
`;
