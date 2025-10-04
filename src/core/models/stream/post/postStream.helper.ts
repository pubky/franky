import { PostStreamModelSchema } from './postStream.schema';

export const createDefaultPostStream = (
  id: string,
  name: string | null = null,
  posts: string[] = [],
): PostStreamModelSchema => {
  return {
    id,
    posts,
    name,
  };
};
