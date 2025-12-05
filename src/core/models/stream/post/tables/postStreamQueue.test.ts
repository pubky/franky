import { db } from '@/core/database';
import { describe, it, expect, beforeEach } from 'vitest';
import { PostStreamQueueModel } from './postStreamQueue';
import { PostStreamTypes, PostStreamId } from '../postStream.types';

describe('PostStreamQueueModel', () => {
  beforeEach(async () => {
    await db.initialize();
    await PostStreamQueueModel.clear();
  });

  describe('constructor', () => {
    it('should create a queue with all properties', () => {
      const queueData = {
        id: PostStreamTypes.TIMELINE_ALL_ALL,
        queue: ['post1', 'post2'],
        streamTail: 1234567890,
      };
      const queueModel = new PostStreamQueueModel(queueData);

      expect(queueModel.id).toBe(PostStreamTypes.TIMELINE_ALL_ALL);
      expect(queueModel.queue).toEqual(['post1', 'post2']);
      expect(queueModel.streamTail).toBe(1234567890);
    });
  });

  describe('findById', () => {
    it('should return null when queue not found', async () => {
      const foundQueue = await PostStreamQueueModel.findById('non-existent' as PostStreamId);
      expect(foundQueue).toBeNull();
    });

    it('should find existing queue by id', async () => {
      const streamId = PostStreamTypes.TIMELINE_ALL_ALL;
      await PostStreamQueueModel.upsert({
        id: streamId,
        queue: ['post1', 'post2'],
        streamTail: 1234567890,
      });

      const foundQueue = await PostStreamQueueModel.findById(streamId);
      expect(foundQueue).not.toBeNull();
      expect(foundQueue!.id).toBe(streamId);
      expect(foundQueue!.queue).toEqual(['post1', 'post2']);
      expect(foundQueue!.streamTail).toBe(1234567890);
    });
  });

  describe('upsert', () => {
    it('should create new queue', async () => {
      const streamId = PostStreamTypes.TIMELINE_FOLLOWING_ALL;
      await PostStreamQueueModel.upsert({
        id: streamId,
        queue: ['post1'],
        streamTail: 100,
      });

      const foundQueue = await PostStreamQueueModel.findById(streamId);
      expect(foundQueue!.queue).toEqual(['post1']);
      expect(foundQueue!.streamTail).toBe(100);
    });

    it('should update existing queue', async () => {
      const streamId = PostStreamTypes.TIMELINE_FRIENDS_ALL;

      await PostStreamQueueModel.upsert({
        id: streamId,
        queue: ['post1'],
        streamTail: 100,
      });

      await PostStreamQueueModel.upsert({
        id: streamId,
        queue: ['post2', 'post3'],
        streamTail: 200,
      });

      const foundQueue = await PostStreamQueueModel.findById(streamId);
      expect(foundQueue!.queue).toEqual(['post2', 'post3']);
      expect(foundQueue!.streamTail).toBe(200);
    });

    it('should handle empty queue', async () => {
      const streamId = PostStreamTypes.TIMELINE_ALL_ALL;
      await PostStreamQueueModel.upsert({
        id: streamId,
        queue: [],
        streamTail: 0,
      });

      const foundQueue = await PostStreamQueueModel.findById(streamId);
      expect(foundQueue!.queue).toEqual([]);
    });
  });

  describe('deleteById', () => {
    it('should delete existing queue', async () => {
      const streamId = PostStreamTypes.TIMELINE_ALL_ALL;
      await PostStreamQueueModel.upsert({
        id: streamId,
        queue: ['post1'],
        streamTail: 100,
      });

      await PostStreamQueueModel.deleteById(streamId);

      const foundQueue = await PostStreamQueueModel.findById(streamId);
      expect(foundQueue).toBeNull();
    });

    it('should not throw when deleting non-existent queue', async () => {
      await expect(PostStreamQueueModel.deleteById('non-existent' as PostStreamId)).resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all queues', async () => {
      await PostStreamQueueModel.upsert({
        id: PostStreamTypes.TIMELINE_ALL_ALL,
        queue: ['post1'],
        streamTail: 100,
      });
      await PostStreamQueueModel.upsert({
        id: PostStreamTypes.TIMELINE_FOLLOWING_ALL,
        queue: ['post2'],
        streamTail: 200,
      });

      await PostStreamQueueModel.clear();

      const queue1 = await PostStreamQueueModel.findById(PostStreamTypes.TIMELINE_ALL_ALL);
      const queue2 = await PostStreamQueueModel.findById(PostStreamTypes.TIMELINE_FOLLOWING_ALL);
      expect(queue1).toBeNull();
      expect(queue2).toBeNull();
    });
  });
});
