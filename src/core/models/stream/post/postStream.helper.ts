import { PostStreamModelSchema } from './postStream.schema';
import { PostStreamTypes } from './postStream.types';

export const createDefaultPostStream = (
  id: PostStreamTypes,
  name: string | null = null,
  posts: string[] = [],
): PostStreamModelSchema => {
  return {
    id,
    posts,
    name,
  };
};
