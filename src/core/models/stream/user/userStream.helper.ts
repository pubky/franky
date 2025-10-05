import { Pubky } from '@/core';
import { UserStreamModelSchema } from './userStream.schema';
import { UserStreamTypes } from './userStream.types';

export const createDefaultUserStream = (id: UserStreamTypes, stream: Pubky[] = []): UserStreamModelSchema => {
  return {
    id,
    stream,
  };
};
