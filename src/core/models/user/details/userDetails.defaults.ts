import * as Core from '@/core';

export const DEFAULT_USER_DETAILS: Omit<Core.NexusUserDetails, 'id'> = {
  name: '',
  bio: '',
  image: null,
  indexed_at: Date.now(),
  links: null,
  status: null,
};
