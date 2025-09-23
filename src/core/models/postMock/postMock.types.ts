import { PostModelPK } from '@/core';

export interface PostMock {
  id: PostModelPK;
  text: string;
  createdAt: number;
}
