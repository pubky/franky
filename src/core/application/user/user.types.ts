import * as Core from '@/core';

export type TUserApplicationFollowParams = Core.TFollowParams & {
  eventType: Core.HomeserverAction;
  followUrl: string;
  followJson: Record<string, unknown>;
};

export type TDeleteAccountParams = {
  pubky: Core.Pubky;
  setProgress?: (progress: number) => void;
};
