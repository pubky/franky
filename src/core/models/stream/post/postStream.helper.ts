import { PostStreamModelSchema } from './postStream.schema';

export const createDefaultStream = (
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
