import * as Core from '@/core';

export type TFeedPersistCreateParams = {
  params: Core.TFeedCreateParams;
  layout: Core.FeedLayout;
  existingId?: string;
};

export type TFeedPersistDeleteParams = {
  feedId: string;
};

export type TFeedPersistParams = TFeedPersistCreateParams | TFeedPersistDeleteParams;

export function isFeedDeleteParams(params: TFeedPersistParams): params is TFeedPersistDeleteParams {
  return !('params' in params);
}
