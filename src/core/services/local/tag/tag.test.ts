import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';
import type { TLocalSaveTagParams, TLocalRemoveTagParams } from './tag.types';

// Test data
const testData = {
  authorPubky: 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy' as Core.Pubky,
  taggerPubky: 'o1gg96ewuojmopcjbz8895478wdtxtzzuxnfjjz8o8e77csa1ngo' as Core.Pubky,
  anotherTaggerPubky: 'y4euc88xboik1ev3axy9m9ajuedo8gx1mh1n7ms8zoxm5s1b1h9y' as Core.Pubky,
  postId: 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy:abc123xyz',
};

// Helper functions
const createTagParams = (label: string): TLocalSaveTagParams => ({
  postId: testData.postId,
  label,
  taggerId: testData.taggerPubky,
});

const createRemoveParams = (label: string): TLocalRemoveTagParams => ({
  postId: testData.postId,
  label,
  taggerId: testData.taggerPubky,
});

const getSavedTags = async () => {
  return await Core.PostTagsModel.table.get(testData.postId);
};

const getSavedCounts = async () => {
  return await Core.PostCountsModel.table.get(testData.postId);
};

const createTagRecord = (label: string, taggers: Core.Pubky[], relationship: boolean) => ({
  label,
  taggers,
  taggers_count: taggers.length,
  relationship,
});

const setupExistingTag = async (label: string, taggers: Core.Pubky[], relationship: boolean) => {
  await Core.PostTagsModel.insert({
    id: testData.postId,
    tags: [createTagRecord(label, taggers, relationship)],
  });
};

const setupPostCounts = async (tags: number, uniqueTags: number) => {
  await Core.PostCountsModel.insert({
    id: testData.postId,
    replies: 0,
    tags,
    unique_tags: uniqueTags,
    reposts: 0,
  });
};

describe('LocalTagService', () => {
  beforeEach(async () => {
    await Core.db.initialize();
    await Core.db.transaction('rw', [Core.PostTagsModel.table, Core.PostCountsModel.table], async () => {
      await Core.PostTagsModel.table.clear();
      await Core.PostCountsModel.table.clear();
    });
  });

  describe('save', () => {
    it('should save a new tag to a post', async () => {
      await Core.Local.Tag.save(createTagParams('javascript'));

      const savedTags = await getSavedTags();
      expect(savedTags).toBeTruthy();
      expect(savedTags!.tags).toHaveLength(1);
      expect(savedTags!.tags[0].label).toBe('javascript');
      expect(savedTags!.tags[0].taggers_count).toBe(1);
      expect(savedTags!.tags[0].relationship).toBe(true);
    });

    it('should add tagger to existing tag', async () => {
      await Core.Local.Tag.save(createTagParams('javascript'));
      await setupExistingTag('javascript', [testData.taggerPubky], false);

      await Core.Local.Tag.save({
        postId: testData.postId,
        label: 'javascript',
        taggerId: testData.anotherTaggerPubky,
      });

      const savedTags = await getSavedTags();
      expect(savedTags!.tags[0].taggers_count).toBe(2);
      expect(savedTags!.tags[0].relationship).toBe(true);
    });

    it('should throw error if user already tagged post with this label', async () => {
      await setupExistingTag('javascript', [testData.taggerPubky], true);

      await expect(Core.Local.Tag.save(createTagParams('javascript'))).rejects.toThrow(
        'User already tagged this post with this label',
      );
    });

    it('should update post counts when adding tag', async () => {
      await setupPostCounts(0, 0);
      await Core.Local.Tag.save(createTagParams('javascript'));

      const savedCounts = await getSavedCounts();
      expect(savedCounts!.tags).toBe(1);
      expect(savedCounts!.unique_tags).toBe(1);
    });

    it('should add multiple different tags to a post', async () => {
      await Core.Local.Tag.save(createTagParams('javascript'));
      await Core.Local.Tag.save(createTagParams('react'));

      const savedTags = await getSavedTags();
      expect(savedTags!.tags).toHaveLength(2);
      expect(savedTags!.tags.map((t) => t.label)).toContain('javascript');
      expect(savedTags!.tags.map((t) => t.label)).toContain('react');
    });
  });

  describe('remove', () => {
    beforeEach(async () => {
      await setupExistingTag('javascript', [testData.taggerPubky], true);
      await setupPostCounts(1, 1);
    });

    it('should remove tag from post', async () => {
      await Core.Local.Tag.remove(createRemoveParams('javascript'));

      const savedTags = await getSavedTags();
      expect(savedTags!.tags).toHaveLength(0);
    });

    it('should update post counts when removing tag', async () => {
      await Core.Local.Tag.remove(createRemoveParams('javascript'));

      const savedCounts = await getSavedCounts();
      expect(savedCounts!.tags).toBe(0);
      expect(savedCounts!.unique_tags).toBe(0);
    });

    it('should throw error if post has no tags', async () => {
      await Core.PostTagsModel.table.clear();

      await expect(Core.Local.Tag.remove(createRemoveParams('javascript'))).rejects.toThrow('Post has no tags');
    });

    it('should throw error if user has not tagged post with this label', async () => {
      await setupExistingTag('javascript', [testData.taggerPubky], false);

      await expect(Core.Local.Tag.remove(createRemoveParams('javascript'))).rejects.toThrow(
        'User has not tagged this post with this label',
      );
    });

    it('should remove only the tagger but keep tag if other taggers exist', async () => {
      await setupExistingTag('javascript', [testData.taggerPubky, testData.anotherTaggerPubky], true);

      await Core.Local.Tag.remove(createRemoveParams('javascript'));

      const savedTags = await getSavedTags();
      expect(savedTags!.tags).toHaveLength(1);
      expect(savedTags!.tags[0].taggers_count).toBe(1);
      expect(savedTags!.tags[0].relationship).toBe(false);
      expect(savedTags!.tags[0].taggers).toContain(testData.anotherTaggerPubky);
      expect(savedTags!.tags[0].taggers).not.toContain(testData.taggerPubky);
    });
  });
});
