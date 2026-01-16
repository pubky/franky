import * as Core from '@/core';
import { HttpMethod } from '@/libs';

export type TUserApplicationFollowParams = Core.TFollowParams & {
  eventType: HttpMethod;
  followUrl: string;
  followJson: Record<string, unknown>;
  activeStreamId?: Core.PostStreamTypes | null;
};

export type TUserApplicationMuteParams = Core.TMuteParams & {
  eventType: HttpMethod;
  muteUrl: string;
  muteJson: Record<string, unknown>;
};
