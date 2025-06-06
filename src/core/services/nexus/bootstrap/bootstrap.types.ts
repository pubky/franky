import { type NexusList, type NexusPost, type NexusUser } from '@/core';

export interface NexusBootstrapResponse {
  users: NexusUser[];
  posts: NexusPost[];
  list: NexusList;
}
