import { PostModelPK, NexusPostDetails } from '@/core';

export type PostControllerNewData = Omit<NexusPostDetails, 'uri'> & {
  id: PostModelPK;
};
