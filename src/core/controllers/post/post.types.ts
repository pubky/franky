import { NexusPostDetails } from '@/core';

export type PostControllerNewData = Omit<NexusPostDetails, 'id' | 'uri'>;
