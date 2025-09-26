import { Pubky } from '@/core';

export interface UserConnectionsModelSchema {
  id: Pubky;
  following: Pubky[];
  followers: Pubky[];
}

// Primary and compound indexes for Dexie
export const userConnectionsTableSchema = `
  &id,
  followers,
  following
`;
