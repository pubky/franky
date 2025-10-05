import { db } from '@/core/database';
import { describe, it, expect, beforeEach } from 'vitest';
import { createDefaultTagStream } from './tagStream.helper';
import { TagStreamModel } from './tagStream';
import { TagStreamTypes } from './tagStream.types';
import { NexusHotTag } from '@/core/services/nexus/nexus.types';

describe('TagStreamModel', () => {
  // Mock NexusHotTag objects for testing
  const mockTag1: NexusHotTag = {
    label: 'tag1',
    taggers_id: ['user1', 'user2', 'user3'],
    tagged_count: 5,
    taggers_count: 3,
  };

  const mockTag2: NexusHotTag = {
    label: 'tag2',
    taggers_id: ['user2', 'user4', 'user5', 'user6'],
    tagged_count: 8,
    taggers_count: 4,
  };

  const mockTag3: NexusHotTag = {
    label: 'tag3',
    taggers_id: ['user1', 'user3', 'user7', 'user8', 'user9', 'user10'],
    tagged_count: 12,
    taggers_count: 6,
  };

  beforeEach(async () => {
    await db.initialize();
  });

  describe('constructor', () => {
    it('should create a tag stream with all properties', () => {
      const streamData = createDefaultTagStream(TagStreamTypes.TODAY_ALL, [mockTag1, mockTag2]);
      const stream = new TagStreamModel(streamData);

      expect(stream.id).toBe(TagStreamTypes.TODAY_ALL);
      expect(stream.tags).toEqual([mockTag1, mockTag2]);
    });

    it('should handle empty tags array', () => {
      const streamData = createDefaultTagStream(TagStreamTypes.TODAY_ALL, []);
      const stream = new TagStreamModel(streamData);

      expect(stream.tags).toEqual([]);
    });
  });

  describe('addTags', () => {
    it('should add multiple tags to stream', () => {
      const streamData = createDefaultTagStream(TagStreamTypes.TODAY_ALL, []);
      const stream = new TagStreamModel(streamData);

      stream.addTags([mockTag1, mockTag2]);

      expect(stream.tags).toEqual([mockTag1, mockTag2]);
    });

    it('should not add duplicate tags', () => {
      const streamData = createDefaultTagStream(TagStreamTypes.TODAY_ALL, [mockTag1]);
      const stream = new TagStreamModel(streamData);

      stream.addTags([mockTag1, mockTag2]);

      expect(stream.tags).toEqual([mockTag2, mockTag1]);
    });

    it('should add tags to beginning for chronological order', () => {
      const streamData = createDefaultTagStream(TagStreamTypes.TODAY_ALL, [mockTag1]);
      const stream = new TagStreamModel(streamData);

      stream.addTags([mockTag2, mockTag3]);

      expect(stream.tags).toEqual([mockTag2, mockTag3, mockTag1]);
    });
  });

  describe('database operations', () => {
    it('should save and retrieve stream', async () => {
      const streamData = createDefaultTagStream(TagStreamTypes.TODAY_ALL, [mockTag1, mockTag2]);
      const stream = new TagStreamModel(streamData);

      await stream.save();

      const foundStream = await TagStreamModel.findById(TagStreamTypes.TODAY_ALL);
      expect(foundStream).toBeTruthy();
      expect(foundStream!.id).toBe(TagStreamTypes.TODAY_ALL);
      expect(foundStream!.tags).toEqual([mockTag1, mockTag2]);
    });

    it('should persist taggers_id arrays correctly', async () => {
      const streamData = createDefaultTagStream(TagStreamTypes.TODAY_ALL, [mockTag1, mockTag2, mockTag3]);
      const stream = new TagStreamModel(streamData);

      await stream.save();

      const foundStream = await TagStreamModel.findById(TagStreamTypes.TODAY_ALL);
      expect(foundStream).toBeTruthy();

      // Check that taggers_id arrays are preserved
      expect(foundStream!.tags[0].taggers_id).toEqual(['user1', 'user2', 'user3']);
      expect(foundStream!.tags[1].taggers_id).toEqual(['user2', 'user4', 'user5', 'user6']);
      expect(foundStream!.tags[2].taggers_id).toEqual(['user1', 'user3', 'user7', 'user8', 'user9', 'user10']);

      // Check that other properties are also preserved
      expect(foundStream!.tags[0].tagged_count).toBe(5);
      expect(foundStream!.tags[1].tagged_count).toBe(8);
      expect(foundStream!.tags[2].tagged_count).toBe(12);
    });

    it('should return null when stream not found', async () => {
      const foundStream = await TagStreamModel.findById('non-existent' as TagStreamTypes);

      expect(foundStream).toBeNull();
    });

    it('should create stream with static method', async () => {
      const stream = await TagStreamModel.create(TagStreamTypes.TODAY_ALL, [mockTag1]);

      expect(stream.id).toBe(TagStreamTypes.TODAY_ALL);
      expect(stream.tags).toEqual([mockTag1]);

      // Verify it was saved to database
      const foundStream = await TagStreamModel.findById(TagStreamTypes.TODAY_ALL);
      expect(foundStream).toBeTruthy();
    });

    it('should delete stream by id', async () => {
      await TagStreamModel.create(TagStreamTypes.TODAY_ALL, [mockTag1]);

      await TagStreamModel.deleteById(TagStreamTypes.TODAY_ALL);

      const foundStream = await TagStreamModel.findById(TagStreamTypes.TODAY_ALL);
      expect(foundStream).toBeNull();
    });
  });
});
