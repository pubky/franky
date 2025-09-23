import { Pubky } from '@/core';

export type ModelUserConnections = {
  id: Pubky;
  following: Pubky[];
  followers: Pubky[];
};

export const DEFAULT_USER_CONNECTIONS = {
  id: '',
  following: [],
  followers: [],
};
