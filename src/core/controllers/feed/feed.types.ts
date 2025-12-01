import { PubkyAppFeedLayout, PubkyAppFeedReach, PubkyAppFeedSort, PubkyAppPostKind } from 'pubky-app-specs';

export type TFeedCreateParams = {
  name: string;
  tags: string[];
  reach: PubkyAppFeedReach;
  sort: PubkyAppFeedSort;
  content: PubkyAppPostKind | null;
  layout: PubkyAppFeedLayout;
};

export type TFeedUpdateParams = {
  feedId: number;
  changes: Partial<Omit<TFeedCreateParams, 'name'>>;
};

export type TFeedDeleteParams = {
  feedId: number;
};
