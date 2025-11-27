import { PubkyAppFeedLayout, PubkyAppFeedReach, PubkyAppFeedSort, PubkyAppPostKind } from 'pubky-app-specs';

export interface FeedModelSchema {
  id: string;
  name: string;
  tags: string[];
  reach: PubkyAppFeedReach;
  sort: PubkyAppFeedSort;
  content: PubkyAppPostKind | null;
  layout: PubkyAppFeedLayout;
  created_at: number;
  updated_at: number;
}

export const feedTableSchema = '&id, name, created_at, updated_at';
