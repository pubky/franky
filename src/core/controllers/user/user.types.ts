import { NexusUserDetails } from '@/core';

export type UserControllerNewData = Omit<NexusUserDetails, 'id' | 'indexed_at' | 'status'>;
