import * as Core from '@/core';

export type TUserApplicationFollowParams = Core.TFollowParams & {
  eventType: Core.HomeserverAction;
  followUrl: string;
  followJson: Record<string, unknown>;
};
