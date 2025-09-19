import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('StreamModel', () => {
  beforeEach(async () => {
    await Core.db.initialize();
  });

  describe('constructor', () => {
    it('should create a stream with all properties', () => {
      const streamData = Core.createDefaultStream('test-stream', 'Test Stream', ['post1', 'post2']);
      const stream = new Core.StreamModel(streamData);

      expect(stream.id).toBe('test-stream');
      expect(stream.name).toBe('Test Stream');
      expect(stream.posts).toEqual(['post1', 'post2']);
    });

    it('should handle null name', () => {
      const streamData = Core.createDefaultStream('test-stream', null);
      const stream = new Core.StreamModel(streamData);

      expect(stream.name).toBeNull();
    });
  });

  describe('addPosts', () => {
    it('should add multiple posts to stream', () => {
      const streamData = Core.createDefaultStream('test-stream', 'Test Stream');
      const stream = new Core.StreamModel(streamData);

      stream.addPosts(['post1', 'post2']);

      expect(stream.posts).toEqual(['post1', 'post2']);
    });

    it('should not add duplicate posts', () => {
      const streamData = Core.createDefaultStream('test-stream', 'Test Stream', ['post1']);
      const stream = new Core.StreamModel(streamData);

      stream.addPosts(['post1', 'post2']);

      expect(stream.posts).toEqual(['post2', 'post1']);
    });

    it('should add posts to beginning for chronological order', () => {
      const streamData = Core.createDefaultStream('test-stream', 'Test Stream', ['post1']);
      const stream = new Core.StreamModel(streamData);

      stream.addPosts(['post2', 'post3']);

      expect(stream.posts).toEqual(['post2', 'post3', 'post1']);
    });
  });

  describe('database operations', () => {
    it('should save and retrieve stream', async () => {
      const streamData = Core.createDefaultStream('test-stream', 'Test Stream');
      const stream = new Core.StreamModel(streamData);

      await stream.save();

      const foundStream = await Core.StreamModel.findById('test-stream');
      expect(foundStream).toBeTruthy();
      expect(foundStream!.id).toBe('test-stream');
      expect(foundStream!.name).toBe('Test Stream');
    });

    it('should return null when stream not found', async () => {
      const foundStream = await Core.StreamModel.findById('non-existent');

      expect(foundStream).toBeNull();
    });

    it('should create stream with static method', async () => {
      const stream = await Core.StreamModel.create('test-stream', 'Test Stream', ['post1']);

      expect(stream.id).toBe('test-stream');
      expect(stream.name).toBe('Test Stream');
      expect(stream.posts).toEqual(['post1']);

      // Verify it was saved to database
      const foundStream = await Core.StreamModel.findById('test-stream');
      expect(foundStream).toBeTruthy();
    });

    it('should delete stream by id', async () => {
      await Core.StreamModel.create('test-stream', 'Test Stream');

      await Core.StreamModel.deleteById('test-stream');

      const foundStream = await Core.StreamModel.findById('test-stream');
      expect(foundStream).toBeNull();
    });
  });
});
