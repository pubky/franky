import { Pubky } from '@/core';
import { UserStreamModelSchema } from './userStream.schema';
import { UserStreamTypes } from './userStream.types';

export const createDefaultUserStream = (id: UserStreamTypes, users: Pubky[] = []): UserStreamModelSchema => {
  return {
    id,
    users,
  };
};
