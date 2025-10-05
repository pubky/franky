import { PostStreamModelSchema } from './postStream.schema';
import { PostStreamTypes } from './postStream.types';

export const createDefaultPostStream = (
  id: PostStreamTypes,
  stream: string[] = [],
  name: string | undefined = undefined,
): PostStreamModelSchema => {
  return {
    id,
    stream,
    name,
  };
};
