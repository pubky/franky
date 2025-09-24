import * as Core from '@/core';

// Post relationships defaults
export const DEFAULT_POST_RELATIONSHIPS: Omit<Core.NexusPostRelationships, 'id'> = {
  replied: null,
  reposted: null,
  mentioned: [],
};
