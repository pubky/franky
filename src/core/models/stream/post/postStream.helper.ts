import { PostStreamModelSchema } from './postStream.schema';
import { PostStreamId } from './postStream.types';

export const createDefaultPostStream = (
  id: PostStreamId,
  stream: string[] = [],
  name: string | undefined = undefined,
): PostStreamModelSchema => {
  return {
    id,
    stream,
    name,
  };
};
