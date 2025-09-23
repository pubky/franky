import * as Core from '@/core';

export interface UserDetailsModelSchema extends Core.NexusUserDetails {
  id: Core.Pubky;
}

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
