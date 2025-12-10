import * as Core from '@/core';

export type NexusBootstrapResponse = {
  users: Core.NexusUser[];
  posts: Core.NexusPost[];
  ids: Core.NexusBootstrapList;
  indexed: boolean;
};

export type NexusBootstrapList = {
  stream: string[];
  influencers: Core.Pubky[];
  recommended: Core.Pubky[];
  hot_tags: Core.NexusHotTag[];
};
