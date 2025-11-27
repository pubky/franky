import { PubkyAppFeedReach, PubkyAppFeedSort, PubkyAppPostKind } from 'pubky-app-specs';
import * as Core from '@/core';

export type TFeedCreateParams = {
  name: string;
  tags: string[];
  reach: PubkyAppFeedReach;
  sort: PubkyAppFeedSort;
  content: PubkyAppPostKind | null;
  layout: Core.FeedLayout;
};

export type TFeedUpdateParams = {
  feedId: string;
  changes: Partial<Omit<TFeedCreateParams, 'name'>>;
};

export type TFeedDeleteParams = {
  feedId: string;
};
