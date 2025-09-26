import * as Core from '@/core';

export interface PostRelationshipsModelSchema extends Core.NexusPostRelationships {
  id: string;
}

// Primary and compound indexes for Dexie
export const postRelationshipsTableSchema = `
  &id,
  replied,
  reposted,
  mentioned
`;
