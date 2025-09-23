import * as Core from '@/core';
import { ModelUserConnections } from './userConnections.default';

export interface UserConnectionsModelSchema extends ModelUserConnections {
  id: Core.Pubky;
}

// Primary and compound indexes for Dexie
export const userConnectionsTableSchema = `
  &id,
  followers,
  following
`;
