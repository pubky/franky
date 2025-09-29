import { PostModelPK, TagModel } from '@/core';

export interface PostMock {
  id: PostModelPK;
  text: string;
  createdAt: number;
  author: string;
  authorPubkey: string;
  tags: TagModel[];
}
