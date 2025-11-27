import { db } from '@/core/database';
import { describe, it, expect, beforeEach } from 'vitest';
import { createDefaultPostStream } from './postStream.helper';
import { PostStreamModel } from './tables';
import { PostStreamTypes, PostStreamId } from './postStream.types';

describe('PostStreamModel', () => {
  beforeEach(async () => {
    await db.initialize();
  });

  describe('constructor', () => {
    it('should create a post stream with all properties', () => {
      const streamData = createDefaultPostStream(PostStreamTypes.TIMELINE_ALL_ALL, ['post1', 'post2'], 'Test Stream');
      const { id, stream } = new PostStreamModel(streamData);

      expect(id).toBe(PostStreamTypes.TIMELINE_ALL_ALL);
      expect(name).toBe('Test Stream');
      expect(stream).toEqual(['post1', 'post2']);
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
      const foundStream = await PostStreamModel.findById('non-existent' as PostStreamId);

      expect(foundStream).toBeNull();
    });
  });
});
