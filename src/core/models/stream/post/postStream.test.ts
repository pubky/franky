import { db } from '@/core/database';
import { describe, it, expect, beforeEach } from 'vitest';
import { createDefaultPostStream } from './postStream.helper';
import { PostStreamModel } from './postStream';

describe('PostStreamModel', () => {
  beforeEach(async () => {
    await db.initialize();
  });

  describe('constructor', () => {
    it('should create a post stream with all properties', () => {
      const streamData = createDefaultPostStream('test-stream', 'Test Stream', ['post1', 'post2']);
      const stream = new PostStreamModel(streamData);

      expect(stream.id).toBe('test-stream');
      expect(stream.name).toBe('Test Stream');
      expect(stream.posts).toEqual(['post1', 'post2']);
    });

    it('should handle null name', () => {
      const streamData = createDefaultPostStream('test-stream', null);
      const stream = new PostStreamModel(streamData);

      expect(stream.name).toBeNull();
    });
  });

  describe('addPosts', () => {
    it('should add multiple posts to stream', () => {
      const streamData = createDefaultPostStream('test-stream', 'Test Stream');
      const stream = new PostStreamModel(streamData);

      stream.addPosts(['post1', 'post2']);

      expect(stream.posts).toEqual(['post1', 'post2']);
    });

    it('should not add duplicate posts', () => {
      const streamData = createDefaultPostStream('test-stream', 'Test Stream', ['post1']);
      const stream = new PostStreamModel(streamData);

      stream.addPosts(['post1', 'post2']);

      expect(stream.posts).toEqual(['post2', 'post1']);
    });

    it('should add posts to beginning for chronological order', () => {
      const streamData = createDefaultPostStream('test-stream', 'Test Stream', ['post1']);
      const stream = new PostStreamModel(streamData);

      stream.addPosts(['post2', 'post3']);

      expect(stream.posts).toEqual(['post2', 'post3', 'post1']);
    });
  });

  describe('database operations', () => {
    it('should save and retrieve stream', async () => {
      const streamData = createDefaultPostStream('test-stream', 'Test Stream');
      const stream = new PostStreamModel(streamData);

      await stream.save();

      const foundStream = await PostStreamModel.findById('test-stream');
      expect(foundStream).toBeTruthy();
      expect(foundStream!.id).toBe('test-stream');
      expect(foundStream!.name).toBe('Test Stream');
    });

    it('should return null when stream not found', async () => {
      const foundStream = await PostStreamModel.findById('non-existent');

      expect(foundStream).toBeNull();
    });

    it('should create stream with static method', async () => {
      const stream = await PostStreamModel.create('test-stream', 'Test Stream', ['post1']);

      expect(stream.id).toBe('test-stream');
      expect(stream.name).toBe('Test Stream');
      expect(stream.posts).toEqual(['post1']);

      // Verify it was saved to database
      const foundStream = await PostStreamModel.findById('test-stream');
      expect(foundStream).toBeTruthy();
    });

    it('should delete stream by id', async () => {
      await PostStreamModel.create('test-stream', 'Test Stream');

      await PostStreamModel.deleteById('test-stream');

      const foundStream = await PostStreamModel.findById('test-stream');
      expect(foundStream).toBeNull();
    });
  });
});
