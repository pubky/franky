import { NexusHotTag } from '@/core';
import { TagStreamModelSchema } from './tagStream.schema';
import { TagStreamTypes } from './tagStream.types';

export const createDefaultTagStream = (id: TagStreamTypes, stream: NexusHotTag[]): TagStreamModelSchema => {
  return {
    id,
    stream,
  };
};
