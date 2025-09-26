import * as Core from '@/core';

export type UserDetailsModelSchema = Core.NexusUserDetails;

// Primary and compound indexes for Dexie
export const userDetailsTableSchema = `
  &id,
  name,
  bio,
  image,
  indexed_at,
  links,
  status
`;
