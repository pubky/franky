import * as Core from '@/core';

export type UserControllerNewData = Omit<Core.NexusUserDetails, 'id' | 'indexed_at' | 'status'>;

export type TReadProfileParams = {
  userId: Core.Pubky;
};
