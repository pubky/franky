import * as Core from '@/core';

export const createDefaultStream = (
  id: string,
  name: string | null = null,
  posts: string[] = [],
): Core.StreamModelSchema => {
  return {
    id,
    posts,
    name,
  };
};
