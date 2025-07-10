import { NexusPostDetails, NexusUserDetails } from '@/core';

export type PostValidatorData = Omit<NexusPostDetails, 'id' | 'uri'>;

export type UserValidatorData = Omit<NexusUserDetails, 'id' | 'indexed_at'>;
