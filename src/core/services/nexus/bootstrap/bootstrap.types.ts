import * as Core from '@/core';

export interface NexusBootstrapResponse {
  users: Core.NexusUser[];
  posts: Core.NexusPost[];
  list: Core.NexusBootstrapList;
}

export interface TBootstrapGuardParams {
  response: Response;
  pubky: string;
}
