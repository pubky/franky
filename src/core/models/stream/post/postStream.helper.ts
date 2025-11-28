import { PostStreamModelSchema } from './postStream.schema';
import { PostStreamId } from './postStream.types';

export const createDefaultPostStream = (id: PostStreamId, stream: string[] = []): PostStreamModelSchema => {
  return {
    id,
    stream,
  };
};
