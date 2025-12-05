import { PostStreamId } from '../postStream.types';

export type PostStreamQueueModelSchema = {
  id: PostStreamId;
  queue: string[];
  streamTail: number;
};

export const postStreamQueueTableSchema = '&id';
