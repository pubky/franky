import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('PostTagsModel', () => {
  beforeEach(async () => {
    await Core.resetDatabase();
  });

  const testPostId1 = 'post-test-1';
  const testPostId2 = 'post-test-2';
  const testUserId1 = Core.generateTestUserId(1);
  const testUserId2 = Core.generateTestUserId(2);

  const MOCK_TAGS_1: Core.NexusTag[] = [
    { label: 'tech', taggers: [testUserId1], taggers_count: 1, relationship: false },
    { label: 'announcement', taggers: [testUserId2], taggers_count: 1, relationship: false },
  ];

  const MOCK_TAGS_2: Core.NexusTag[] = [
    { label: 'news', taggers: [testUserId1], taggers_count: 1, relationship: false },
  ];

  describe('Constructor', () => {
    it('should create PostTagsModel instance with id and TagModel array', () => {
      const data = { id: testPostId1, tags: MOCK_TAGS_1 };
      const model = new Core.PostTagsModel(data);
      expect(model.id).toBe(testPostId1);
      expect(model.tags.length).toBe(2);
      expect(model.tags[0]).toBeInstanceOf(Core.TagModel);
      const labels = model.tags.map((t) => t.label).sort();
      expect(labels).toEqual(['announcement', 'tech']);
    });
  });

  describe('Instance helpers', () => {
    it('should save and remove a tag for a user', () => {
      const model = new Core.PostTagsModel({ id: testPostId1, tags: [] });

      expect(() => model.saveTag('tech', testUserId1)).not.toThrow();
      const techTag = model.findByLabel('tech');
      expect(techTag).not.toBeNull();
      expect(techTag!.taggers.includes(testUserId1)).toBe(true);

      expect(() => model.removeTag('tech', testUserId1)).not.toThrow();
      const techAfterRemove = model.findByLabel('tech');
      expect(techAfterRemove).toBeNull();
    });

    it('should find tag by label', () => {
      const model = new Core.PostTagsModel({ id: testPostId1, tags: MOCK_TAGS_1 });

      const techTag = model.findByLabel('tech');
      expect(techTag).not.toBeNull();
      expect(techTag!.label).toBe('tech');

      const announcementTag = model.findByLabel('announcement');
      expect(announcementTag).not.toBeNull();
      expect(announcementTag!.label).toBe('announcement');

      const nonExistentTag = model.findByLabel('nonexistent');
      expect(nonExistentTag).toBeNull();
    });

    it('should handle removing taggers via removeTag', () => {
      const model = new Core.PostTagsModel({ id: testPostId1, tags: MOCK_TAGS_1 });

      // Remove existing tagger
      const techExisting = model.findByLabel('tech');
      expect(techExisting).not.toBeNull();
      techExisting!.setRelationship(true);
      expect(() => model.removeTag('tech', testUserId1)).not.toThrow();
      const techTagAfter = model.findByLabel('tech');
      // tag should be deleted because taggers_count is 0
      expect(techTagAfter).toBeNull();

      // Removing a non-existent label should throw
      expect(() => model.removeTag('nonexistent', testUserId1)).toThrow();
    });
  });

  describe('Static Methods', () => {
    it('should insert post tags', async () => {
      const rec = { id: testPostId1, tags: MOCK_TAGS_1 };
      const result = await Core.PostTagsModel.insert(rec);
      expect(result).toBeDefined();
    });

    it('should find post tags by id', async () => {
      const rec = { id: testPostId1, tags: MOCK_TAGS_1 };
      await Core.PostTagsModel.insert(rec);
      const found = await Core.PostTagsModel.findById(testPostId1);
      expect(found).not.toBeNull();
      expect(found!).toBeInstanceOf(Core.PostTagsModel);
      expect(found!.id).toBe(testPostId1);
      const labels = found!.tags.map((t) => t.label).sort();
      expect(labels).toEqual(['announcement', 'tech']);
    });

    it('should return null for non-existent post tags', async () => {
      const nonExistentId = 'non-existent-post-999';
      const result = await Core.PostTagsModel.findById(nonExistentId);
      expect(result).toBeNull();
    });

    it('should bulk save post tags from tuples', async () => {
      const tuples: Core.NexusModelTuple<Core.NexusTag[]>[] = [
        [testPostId1, MOCK_TAGS_1],
        [testPostId2, MOCK_TAGS_2],
      ];

      const result = await Core.PostTagsModel.bulkSave(tuples);
      expect(result).toBeDefined();

      const tags1 = await Core.PostTagsModel.findById(testPostId1);
      const tags2 = await Core.PostTagsModel.findById(testPostId2);

      expect(tags1).not.toBeNull();
      expect(tags2).not.toBeNull();
      expect(tags1!.tags.map((t) => t.label).sort()).toEqual(['announcement', 'tech']);
      expect(tags2!.tags.map((t) => t.label)).toEqual(['news']);
    });

    it('should handle empty array in bulk save', async () => {
      const result = await Core.PostTagsModel.bulkSave([]);
      expect(result).toBeUndefined();
    });

    it('should handle post-specific tagging scenarios', async () => {
      // Test scenario where multiple users tag a post with same label
      const postWithMultipleTaggers = {
        id: testPostId1,
        tags: [
          { label: 'trending', taggers: [testUserId1, testUserId2], taggers_count: 2, relationship: false },
        ] as Core.NexusTag[],
      };

      await Core.PostTagsModel.insert(postWithMultipleTaggers);
      const found = await Core.PostTagsModel.findById(testPostId1);
      expect(found).not.toBeNull();

      const trending = found!.findByLabel('trending');
      expect(trending).not.toBeNull();
      expect(trending!.taggers).toEqual([testUserId1, testUserId2]);
      expect(trending!.taggers.length).toBe(2);
    });
  });
});
