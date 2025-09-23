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
      expect(model.getUniqueLabels().sort()).toEqual(['dev', 'friend']);
    });
  });

  describe('Instance helpers', () => {
    it('should add/remove taggers and query taggers', () => {
      const model = new Core.UserTagsModel({ id: testUserId1, tags: [] });

      expect(model.addTagger('dev', testUserId2)).toBe(true);
      expect(model.addTagger('dev', testUserId2)).toBe(false); // duplicate prevented
      expect(model.findByLabel('dev').length).toBe(1);
      expect(model.getTaggers('dev').includes(testUserId2)).toBe(true);

      expect(model.removeTagger('dev', testUserId2)).toBe(true);
      expect(model.removeTagger('dev', testUserId2)).toBe(false);
    });

    it('should find tags by label', () => {
      const model = new Core.UserTagsModel({ id: testUserId1, tags: MOCK_TAGS_1 });

      const devTags = model.findByLabel('dev');
      expect(devTags.length).toBe(1);
      expect(devTags[0].label).toBe('dev');

      const friendTags = model.findByLabel('friend');
      expect(friendTags.length).toBe(1);
      expect(friendTags[0].label).toBe('friend');

      const nonExistentTags = model.findByLabel('nonexistent');
      expect(nonExistentTags.length).toBe(0);
    });

    it('should find tags by tagger', () => {
      const model = new Core.UserTagsModel({ id: testUserId1, tags: MOCK_TAGS_1 });

      const tagsByUser2 = model.findByTagger(testUserId2);
      expect(tagsByUser2.length).toBe(2);
      expect(tagsByUser2.map((t) => t.label).sort()).toEqual(['dev', 'friend']);

      const tagsByNonExistent = model.findByTagger('nonexistent-user');
      expect(tagsByNonExistent.length).toBe(0);
    });

    it('should get unique labels', () => {
      const model = new Core.UserTagsModel({ id: testUserId1, tags: MOCK_TAGS_1 });

      const labels = model.getUniqueLabels();
      expect(labels.sort()).toEqual(['dev', 'friend']);
    });

    it('should get taggers for a specific label with pagination', () => {
      const testUserId3 = Core.generateTestUserId(3);
      const tagsWithMultipleTaggers: Core.NexusTag[] = [
        {
          label: 'popular',
          taggers: [testUserId1, testUserId2, testUserId3],
          taggers_count: 3,
          relationship: false,
        },
      ];

      const model = new Core.UserTagsModel({ id: testUserId1, tags: tagsWithMultipleTaggers });

      // Get all taggers
      const allTaggers = model.getTaggers('popular');
      expect(allTaggers.length).toBe(3);
      expect(allTaggers).toContain(testUserId1);
      expect(allTaggers).toContain(testUserId2);
      expect(allTaggers).toContain(testUserId3);

      // Get with pagination
      const firstTwo = model.getTaggers('popular', { skip: 0, limit: 2 });
      expect(firstTwo.length).toBe(2);

      const lastOne = model.getTaggers('popular', { skip: 2, limit: 1 });
      expect(lastOne.length).toBe(1);

      // Non-existent label
      const noTaggers = model.getTaggers('nonexistent');
      expect(noTaggers.length).toBe(0);
    });

    it('should handle adding taggers to new and existing labels', () => {
      const model = new Core.UserTagsModel({ id: testUserId1, tags: [] });

      // Add to new label (creates new tag)
      expect(model.addTagger('newlabel', testUserId1)).toBe(true);
      expect(model.tags.length).toBe(1);
      expect(model.tags[0].label).toBe('newlabel');
      expect(model.tags[0].taggers).toContain(testUserId1);

      // Add different user to same label
      expect(model.addTagger('newlabel', testUserId2)).toBe(true);
      expect(model.tags.length).toBe(1); // Still one tag
      expect(model.tags[0].taggers).toContain(testUserId1);
      expect(model.tags[0].taggers).toContain(testUserId2);
      expect(model.tags[0].taggers_count).toBe(2);

      // Try to add duplicate
      expect(model.addTagger('newlabel', testUserId1)).toBe(false);
      expect(model.tags[0].taggers_count).toBe(2); // Count unchanged
    });

    it('should handle removing taggers', () => {
      const model = new Core.UserTagsModel({ id: testUserId1, tags: MOCK_TAGS_1 });

      // Remove existing tagger
      expect(model.removeTagger('dev', testUserId2)).toBe(true);
      const devTag = model.findByLabel('dev')[0];
      expect(devTag.taggers).not.toContain(testUserId2);
      expect(devTag.taggers_count).toBe(0);

      // Try to remove non-existent tagger
      expect(model.removeTagger('dev', 'nonexistent')).toBe(false);

      // Try to remove from non-existent label
      expect(model.removeTagger('nonexistent', testUserId1)).toBe(false);
    });
  });

  describe('Static Methods', () => {
    it('should insert user tags', async () => {
      const rec = { id: testUserId1, tags: MOCK_TAGS_1 };
      const result = await Core.UserTagsModel.insert(rec);
      expect(result).toBeDefined();
    });

    it('should find user tags by id', async () => {
      const rec = { id: testUserId1, tags: MOCK_TAGS_1 };
      await Core.UserTagsModel.insert(rec);
      const found = await Core.UserTagsModel.findById(testUserId1);
      expect(found).toBeInstanceOf(Core.UserTagsModel);
      expect(found.id).toBe(testUserId1);
      expect(found.getUniqueLabels().sort()).toEqual(['dev', 'friend']);
    });

    it('should throw error for non-existent user tags', async () => {
      const nonExistentId = Core.generateTestUserId(999);
      await expect(Core.UserTagsModel.findById(nonExistentId)).rejects.toThrow(`Tags not found: ${nonExistentId}`);
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

      expect(tags1.getUniqueLabels().sort()).toEqual(['dev', 'friend']);
      expect(tags2.getUniqueLabels()).toEqual(['artist']);
    });

    it('should handle empty array in bulk save', async () => {
      const result = await Core.UserTagsModel.bulkSave([]);
      expect(result).toBeUndefined();
    });
  });
});
