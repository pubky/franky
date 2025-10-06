import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('UserTagsModel', () => {
  beforeEach(async () => {
    await Core.resetDatabase();
  });

  const testUserId1 = Core.generateTestUserId(1);
  const testUserId2 = Core.generateTestUserId(2);

  const MOCK_TAGS_1: Core.NexusTag[] = [
    { label: 'dev', taggers: [testUserId2], taggers_count: 1, relationship: false },
    { label: 'friend', taggers: [testUserId2], taggers_count: 1, relationship: true },
  ];

  const MOCK_TAGS_2: Core.NexusTag[] = [
    { label: 'artist', taggers: [testUserId1], taggers_count: 1, relationship: false },
  ];

  describe('Constructor', () => {
    it('should create UserTagsModel instance with id and TagModel array', () => {
      const data = { id: testUserId1, tags: MOCK_TAGS_1 };
      const model = new Core.UserTagsModel(data);
      expect(model.id).toBe(testUserId1);
      expect(model.tags.length).toBe(2);
      expect(model.tags[0]).toBeInstanceOf(Core.TagModel);
      const labels = model.tags.map((t) => t.label).sort();
      expect(labels).toEqual(['dev', 'friend']);
    });
  });

  describe('Instance helpers', () => {
    it('should add and remove taggers using TagModel', () => {
      const model = new Core.UserTagsModel({ id: testUserId1, tags: MOCK_TAGS_1 });

      const devTag = model.findByLabel('dev');
      expect(devTag).not.toBeNull();
      devTag!.addTagger(testUserId1);
      expect(devTag!.taggers).toContain(testUserId1);
      expect(devTag!.taggers_count).toBe(2);

      devTag!.removeTagger(testUserId2);
      expect(devTag!.taggers).not.toContain(testUserId2);
      expect(devTag!.taggers_count).toBe(1);
    });

    it('should find tag by label', () => {
      const model = new Core.UserTagsModel({ id: testUserId1, tags: MOCK_TAGS_1 });

      const devTag = model.findByLabel('dev');
      expect(devTag).not.toBeNull();
      expect(devTag!.label).toBe('dev');

      const friendTag = model.findByLabel('friend');
      expect(friendTag).not.toBeNull();
      expect(friendTag!.label).toBe('friend');

      const nonExistentTag = model.findByLabel('nonexistent');
      expect(nonExistentTag).toBeNull();
    });

    // Removing taggers, pagination, and find-by-tagger are not supported helpers on the collection.
  });

  describe('Static Methods', () => {
    it('should create user tags', async () => {
      const rec = { id: testUserId1, tags: MOCK_TAGS_1 };
      const result = await Core.UserTagsModel.create(rec);
      expect(result).toBeDefined();
    });

    it('should find user tags by id', async () => {
      const rec = { id: testUserId1, tags: MOCK_TAGS_1 };
      await Core.UserTagsModel.create(rec);
      const found = await Core.UserTagsModel.findById(testUserId1);
      expect(found).not.toBeNull();
      expect(found!).toBeInstanceOf(Core.UserTagsModel);
      expect(found!.id).toBe(testUserId1);
      expect(found!.tags.map((t) => t.label).sort()).toEqual(['dev', 'friend']);
    });

    it('should return null for non-existent user tags', async () => {
      const nonExistentId = Core.generateTestUserId(999);
      const result = await Core.UserTagsModel.findById(nonExistentId);
      expect(result).toBeNull();
    });

    it('should bulk save user tags from tuples', async () => {
      const tuples: Core.NexusModelTuple<Core.NexusTag[]>[] = [
        [testUserId1, MOCK_TAGS_1],
        [testUserId2, MOCK_TAGS_2],
      ];

      const result = await Core.UserTagsModel.bulkSave(tuples);
      expect(result).toBeDefined();

      const tags1 = await Core.UserTagsModel.findById(testUserId1);
      const tags2 = await Core.UserTagsModel.findById(testUserId2);

      expect(tags1).not.toBeNull();
      expect(tags2).not.toBeNull();
      expect(tags1!.tags.map((t) => t.label).sort()).toEqual(['dev', 'friend']);
      expect(tags2!.tags.map((t) => t.label)).toEqual(['artist']);
    });

    it('should handle empty array in bulk save', async () => {
      const result = await Core.UserTagsModel.bulkSave([]);
      expect(result).toBeUndefined();
    });
  });
});
