import { PubkyAppFeedLayout } from 'pubky-app-specs';
import * as Core from '@/core';

export type TFeedPersistCreateParams = {
  params: Core.TFeedCreateParams;
  layout: PubkyAppFeedLayout;
  existingId?: string;
};

export type TFeedPersistDeleteParams = {
  feedId: string;
};

export type TFeedPersistParams = TFeedPersistCreateParams | TFeedPersistDeleteParams;

export function isFeedDeleteParams(params: TFeedPersistParams): params is TFeedPersistDeleteParams {
  return !('params' in params);
}
