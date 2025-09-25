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
      expect(model.getUniqueLabels().sort()).toEqual(['announcement', 'tech']);
    });
  });

  describe('Instance helpers', () => {
    it('should add/remove taggers and query taggers', () => {
      const model = new Core.PostTagsModel({ id: testPostId1, tags: [] });

      expect(model.addTagger('tech', testUserId1)).toBe(true);
      expect(model.addTagger('tech', testUserId1)).toBe(false); // duplicate prevented
      expect(model.findByLabel('tech').length).toBe(1);
      expect(model.getTaggers('tech').includes(testUserId1)).toBe(true);

      expect(model.removeTagger('tech', testUserId1)).toBe(true);
      expect(model.removeTagger('tech', testUserId1)).toBe(false);
    });

    it('should find tags by label', () => {
      const model = new Core.PostTagsModel({ id: testPostId1, tags: MOCK_TAGS_1 });

      const techTags = model.findByLabel('tech');
      expect(techTags.length).toBe(1);
      expect(techTags[0].label).toBe('tech');

      const announcementTags = model.findByLabel('announcement');
      expect(announcementTags.length).toBe(1);
      expect(announcementTags[0].label).toBe('announcement');

      const nonExistentTags = model.findByLabel('nonexistent');
      expect(nonExistentTags.length).toBe(0);
    });

    it('should find tags by tagger', () => {
      const model = new Core.PostTagsModel({ id: testPostId1, tags: MOCK_TAGS_1 });

      const tagsByUser1 = model.findByTagger(testUserId1);
      expect(tagsByUser1.length).toBe(1);
      expect(tagsByUser1[0].label).toBe('tech');

      const tagsByUser2 = model.findByTagger(testUserId2);
      expect(tagsByUser2.length).toBe(1);
      expect(tagsByUser2[0].label).toBe('announcement');

      const tagsByNonExistent = model.findByTagger('nonexistent-user');
      expect(tagsByNonExistent.length).toBe(0);
    });

    it('should get unique labels', () => {
      const model = new Core.PostTagsModel({ id: testPostId1, tags: MOCK_TAGS_1 });

      const labels = model.getUniqueLabels();
      expect(labels.sort()).toEqual(['announcement', 'tech']);
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

      const model = new Core.PostTagsModel({ id: testPostId1, tags: tagsWithMultipleTaggers });

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
      const model = new Core.PostTagsModel({ id: testPostId1, tags: [] });

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
      const model = new Core.PostTagsModel({ id: testPostId1, tags: MOCK_TAGS_1 });

      // Remove existing tagger
      expect(model.removeTagger('tech', testUserId1)).toBe(true);
      const techTag = model.findByLabel('tech')[0];
      expect(techTag.taggers).not.toContain(testUserId1);
      expect(techTag.taggers_count).toBe(0);

      // Try to remove non-existent tagger
      expect(model.removeTagger('tech', 'nonexistent')).toBe(false);

      // Try to remove from non-existent label
      expect(model.removeTagger('nonexistent', testUserId1)).toBe(false);
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
      expect(found).toBeInstanceOf(Core.PostTagsModel);
      expect(found.id).toBe(testPostId1);
      expect(found.getUniqueLabels().sort()).toEqual(['announcement', 'tech']);
    });

    it('should throw error for non-existent post tags', async () => {
      const nonExistentId = 'non-existent-post-999';
      await expect(Core.PostTagsModel.findById(nonExistentId)).rejects.toThrow(
        `Tags not found in post_tags: ${nonExistentId}`,
      );
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

      expect(tags1.getUniqueLabels().sort()).toEqual(['announcement', 'tech']);
      expect(tags2.getUniqueLabels()).toEqual(['news']);
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

      expect(found.getTaggers('trending')).toEqual([testUserId1, testUserId2]);
      expect(found.getTaggers('trending').length).toBe(2);
    });
  });
});
