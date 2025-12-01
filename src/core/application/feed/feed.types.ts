import { FeedResult } from 'pubky-app-specs';
import * as Core from '@/core';

export type TFeedPersistCreateParams = {
  feed: FeedResult;
  existingId?: number;
};

export type TFeedPersistUpdateParams = {
  feedId: number;
  changes: Partial<Omit<Core.TFeedCreateParams, 'name'>>;
};

export type TFeedPersistDeleteParams = {
  feedId: number;
};

export type TFeedPersistParams = TFeedPersistCreateParams | TFeedPersistUpdateParams | TFeedPersistDeleteParams;

export type TFeedPersistInput = {
  action: Core.HomeserverAction;
  userId: Core.Pubky;
  params: TFeedPersistParams;
};

export function isFeedDeleteParams(params: TFeedPersistParams): params is TFeedPersistDeleteParams {
  return 'feedId' in params && !('changes' in params) && !('feed' in params);
}

export function isFeedUpdateParams(params: TFeedPersistParams): params is TFeedPersistUpdateParams {
  return 'feedId' in params && 'changes' in params;
}
