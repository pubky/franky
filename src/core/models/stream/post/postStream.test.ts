import { db } from '@/core/database';
import { describe, it, expect, beforeEach } from 'vitest';
import { createDefaultPostStream } from './postStream.helper';
import { PostStreamModel } from './postStream';
import { PostStreamTypes } from './postStream.types';

describe('PostStreamModel', () => {
  beforeEach(async () => {
    await db.initialize();
  });

  describe('constructor', () => {
    it('should create a post stream with all properties', () => {
      const streamData = createDefaultPostStream(PostStreamTypes.TIMELINE_ALL_ALL, ['post1', 'post2'], 'Test Stream');
      const { id, name, stream } = new PostStreamModel(streamData);

      expect(id).toBe(PostStreamTypes.TIMELINE_ALL_ALL);
      expect(name).toBe('Test Stream');
      expect(stream).toEqual(['post1', 'post2']);
    });

    it('should handle null name', () => {
      const streamData = createDefaultPostStream(PostStreamTypes.TIMELINE_ALL_ALL);
      const { name } = new PostStreamModel(streamData);

      expect(name).toBeUndefined();
    });
  });

  describe('addPosts', () => {
    it('should add multiple posts to stream', () => {
      const streamData = createDefaultPostStream(PostStreamTypes.TIMELINE_ALL_ALL, [], 'Test Stream');
      const timeline_stream = new PostStreamModel(streamData);

      timeline_stream.addPosts(['post1', 'post2']);

      expect(timeline_stream.stream).toEqual(['post1', 'post2']);
    });

    it('should not add duplicate posts', () => {
      const streamData = createDefaultPostStream(PostStreamTypes.TIMELINE_ALL_ALL, ['post1'], 'Test Stream');
      const timeline_stream = new PostStreamModel(streamData);

      timeline_stream.addPosts(['post1', 'post2']);

      expect(timeline_stream.stream).toEqual(['post2', 'post1']);
    });

    it('should add posts to beginning for chronological order', () => {
      const streamData = createDefaultPostStream(PostStreamTypes.TIMELINE_ALL_ALL, ['post1'], 'Test Stream');
      const timeline_stream = new PostStreamModel(streamData);

      timeline_stream.addPosts(['post2', 'post3']);

      expect(timeline_stream.stream).toEqual(['post2', 'post3', 'post1']);
    });
  });

  describe('database operations', () => {
    it('should return null when stream not found', async () => {
      const foundStream = await PostStreamModel.findById('non-existent' as PostStreamTypes);

      expect(foundStream).toBeNull();
    });

    it('should create stream with static method', async () => {
      const { id, name, stream } = await PostStreamModel.createWithName(
        PostStreamTypes.TIMELINE_ALL_ALL,
        ['post1'],
        'Test Stream',
      );

      expect(id).toBe(PostStreamTypes.TIMELINE_ALL_ALL);
      expect(name).toBe('Test Stream');
      expect(stream).toEqual(['post1']);

      // Verify it was saved to database
      const foundStream = await PostStreamModel.findById(PostStreamTypes.TIMELINE_ALL_ALL);
      expect(foundStream).toBeTruthy();
    });

    it('should delete stream by id', async () => {
      await PostStreamModel.createWithName(PostStreamTypes.TIMELINE_ALL_ALL, ['post1'], 'Test Stream');
      await PostStreamModel.deleteById(PostStreamTypes.TIMELINE_ALL_ALL);

      const foundStream = await PostStreamModel.findById(PostStreamTypes.TIMELINE_ALL_ALL);
      expect(foundStream).toBeNull();
    });
  });
});
