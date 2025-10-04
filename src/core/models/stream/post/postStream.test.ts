import { db } from '@/core/database';
import { describe, it, expect, beforeEach } from 'vitest';
<<<<<<< HEAD
import { createDefaultPostStream } from './postStream.helper';
import { PostStreamModel } from './postStream';
import { PostStreamTypes } from './postStream.types';
=======
import { createDefaultStream } from './postStream.helper';
import { PostStreamModel } from './postStream';
>>>>>>> 8f93f84 (rename stream table to post_stream)

describe('PostStreamModel', () => {
  beforeEach(async () => {
    await db.initialize();
  });

  describe('constructor', () => {
    it('should create a post stream with all properties', () => {
      const streamData = createDefaultPostStream(PostStreamTypes.TIMELINE_ALL, 'Test Stream', ['post1', 'post2']);
      const stream = new PostStreamModel(streamData);

      expect(stream.id).toBe(PostStreamTypes.TIMELINE_ALL);
      expect(stream.name).toBe('Test Stream');
      expect(stream.posts).toEqual(['post1', 'post2']);
    });

    it('should handle null name', () => {
      const streamData = createDefaultPostStream(PostStreamTypes.TIMELINE_ALL, null);
      const stream = new PostStreamModel(streamData);

      expect(stream.name).toBeNull();
    });
  });

  describe('addPosts', () => {
    it('should add multiple posts to stream', () => {
      const streamData = createDefaultPostStream(PostStreamTypes.TIMELINE_ALL, 'Test Stream');
      const stream = new PostStreamModel(streamData);

      stream.addPosts(['post1', 'post2']);

      expect(stream.posts).toEqual(['post1', 'post2']);
    });

    it('should not add duplicate posts', () => {
      const streamData = createDefaultPostStream(PostStreamTypes.TIMELINE_ALL, 'Test Stream', ['post1']);
      const stream = new PostStreamModel(streamData);

      stream.addPosts(['post1', 'post2']);

      expect(stream.posts).toEqual(['post2', 'post1']);
    });

    it('should add posts to beginning for chronological order', () => {
      const streamData = createDefaultPostStream(PostStreamTypes.TIMELINE_ALL, 'Test Stream', ['post1']);
      const stream = new PostStreamModel(streamData);

      stream.addPosts(['post2', 'post3']);

      expect(stream.posts).toEqual(['post2', 'post3', 'post1']);
    });
  });

  describe('database operations', () => {
    it('should save and retrieve stream', async () => {
      const streamData = createDefaultPostStream(PostStreamTypes.TIMELINE_ALL, 'Test Stream');
      const stream = new PostStreamModel(streamData);

      await stream.save();

      const foundStream = await PostStreamModel.findById(PostStreamTypes.TIMELINE_ALL);
      expect(foundStream).toBeTruthy();
      expect(foundStream!.id).toBe(PostStreamTypes.TIMELINE_ALL);
      expect(foundStream!.name).toBe('Test Stream');
    });

    it('should return null when stream not found', async () => {
      const foundStream = await PostStreamModel.findById('non-existent' as PostStreamTypes);

      expect(foundStream).toBeNull();
    });

    it('should create stream with static method', async () => {
      const stream = await PostStreamModel.create(PostStreamTypes.TIMELINE_ALL, 'Test Stream', ['post1']);

      expect(stream.id).toBe(PostStreamTypes.TIMELINE_ALL);
      expect(stream.name).toBe('Test Stream');
      expect(stream.posts).toEqual(['post1']);

      // Verify it was saved to database
      const foundStream = await PostStreamModel.findById(PostStreamTypes.TIMELINE_ALL);
      expect(foundStream).toBeTruthy();
    });

    it('should delete stream by id', async () => {
      await PostStreamModel.create(PostStreamTypes.TIMELINE_ALL, 'Test Stream');

      await PostStreamModel.deleteById(PostStreamTypes.TIMELINE_ALL);

      const foundStream = await PostStreamModel.findById(PostStreamTypes.TIMELINE_ALL);
      expect(foundStream).toBeNull();
    });
  });
});
