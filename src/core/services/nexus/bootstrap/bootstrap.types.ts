import * as Core from '@/core';

export type NexusBootstrapResponse = {
  users: Core.NexusUser[];
  posts: Core.NexusPost[];
  list: Core.NexusBootstrapList;
};

export type NexusBootstrapList = {
  stream: string[];
  influencers: Core.Pubky[];
  recommended: Core.Pubky[];
  hot_tags: Core.NexusHotTag[];
};
