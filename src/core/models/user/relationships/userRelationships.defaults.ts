import * as Core from '@/core';

export const DEFAULT_USER_RELATIONSHIP: Omit<Core.NexusUserRelationship, 'id'> = {
  followed_by: false,
  following: false,
  muted: false,
};
