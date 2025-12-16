import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';

// Test data
const testData = {
  taggerPubky: 'o1gg96ewuojmopcjbz8895478wdtxtzzuxnfjjz8o8e77csa1ngo' as Core.Pubky,
  taggedPubky: 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy' as Core.Pubky,
  anotherTaggerPubky: 'y4euc88xboik1ev3axy9m9ajuedo8gx1mh1n7ms8zoxm5s1b1h9y' as Core.Pubky,
};

// Helper functions
const createTagParams = (label: string): Core.TLocalTagParams => ({
  taggedId: testData.taggedPubky,
  label,
  taggerId: testData.taggerPubky,
});

const getSavedUserTags = async () => {
  return await Core.UserTagsModel.findById(testData.taggedPubky);
};

const getSavedUserCounts = async (userId: Core.Pubky) => {
  return await Core.UserCountsModel.table.get(userId);
};

const createTagRecord = (label: string, taggers: Core.Pubky[], relationship: boolean) => ({
  label,
  taggers,
  taggers_count: taggers.length,
  relationship,
});

const setupExistingUserTag = async (label: string, taggers: Core.Pubky[], relationship: boolean) => {
  await Core.UserTagsModel.upsert({
    id: testData.taggedPubky,
    tags: [createTagRecord(label, taggers, relationship)],
  });
};

const setupUserCounts = async (userId: Core.Pubky, tags: number = 0, uniqueTags: number = 0, tagged: number = 0) => {
  await Core.UserCountsModel.upsert({
    id: userId,
    tagged,
    tags,
    unique_tags: uniqueTags,
    posts: 0,
    replies: 0,
    following: 0,
    followers: 0,
    friends: 0,
    bookmarks: 0,
  });
};

describe('LocalUserTagService', () => {
  beforeEach(async () => {
    await Core.db.initialize();
    await Core.db.transaction('rw', [Core.UserTagsModel.table, Core.UserCountsModel.table], async () => {
      await Core.UserTagsModel.table.clear();
      await Core.UserCountsModel.table.clear();
    });
  });

  describe('create', () => {
    it('should create a new tag and update counts', async () => {
      await setupUserCounts(testData.taggedPubky, 0, 0);
      await setupUserCounts(testData.taggerPubky, 0, 0, 0);

      await Core.LocalUserTagService.create(createTagParams('developer'));

      const savedTags = await getSavedUserTags();
      const taggedCounts = await getSavedUserCounts(testData.taggedPubky);
      const taggerCounts = await getSavedUserCounts(testData.taggerPubky);

      expect(savedTags!.tags).toHaveLength(1);
      expect(savedTags!.tags[0].label).toBe('developer');
      expect(savedTags!.tags[0].taggers_count).toBe(1);
      expect(taggedCounts!.tags).toBe(1);
      expect(taggedCounts!.unique_tags).toBe(1);
      expect(taggerCounts!.tagged).toBe(1);
    });

    it('should add tagger to existing tag', async () => {
      await setupExistingUserTag('developer', [testData.taggerPubky], false);

      await Core.LocalUserTagService.create({
        taggedId: testData.taggedPubky,
        label: 'developer',
        taggerId: testData.anotherTaggerPubky,
      });

      const savedTags = await getSavedUserTags();
      expect(savedTags!.tags[0].taggers_count).toBe(2);
      expect(savedTags!.tags[0].taggers).toContain(testData.anotherTaggerPubky);
    });

    it('should ignore duplicate tags', async () => {
      await setupExistingUserTag('developer', [testData.taggerPubky], true);
      await setupUserCounts(testData.taggedPubky, 1, 1);
      await setupUserCounts(testData.taggerPubky, 0, 0, 1);

      await Core.LocalUserTagService.create(createTagParams('developer'));

      const savedTags = await getSavedUserTags();
      const taggedCounts = await getSavedUserCounts(testData.taggedPubky);
      const taggerCounts = await getSavedUserCounts(testData.taggerPubky);

      expect(savedTags!.tags[0].taggers_count).toBe(1);
      expect(taggedCounts!.tags).toBe(1);
      expect(taggerCounts!.tagged).toBe(1);
    });

    it('should update unique_tags only for new tags, not existing ones', async () => {
      await setupUserCounts(testData.taggedPubky, 0, 0);

      // Create first tag - should increment unique_tags
      await Core.LocalUserTagService.create(createTagParams('developer'));
      let savedCounts = await getSavedUserCounts(testData.taggedPubky);
      expect(savedCounts!.unique_tags).toBe(1);

      // Add another tagger to same tag - should NOT increment unique_tags
      await Core.LocalUserTagService.create({
        taggedId: testData.taggedPubky,
        label: 'developer',
        taggerId: testData.anotherTaggerPubky,
      });
      savedCounts = await getSavedUserCounts(testData.taggedPubky);
      expect(savedCounts!.unique_tags).toBe(1); // Should remain 1

      // Create different tag - should increment unique_tags
      await Core.LocalUserTagService.create(createTagParams('javascript'));
      savedCounts = await getSavedUserCounts(testData.taggedPubky);
      expect(savedCounts!.unique_tags).toBe(2);
    });

    it('should handle database errors', async () => {
      const spy = vi.spyOn(Core.UserTagsModel, 'getOrCreate').mockRejectedValueOnce(new Error('DB Error'));

      await expect(Core.LocalUserTagService.create(createTagParams('developer'))).rejects.toThrow(
        'Failed to create user tag',
      );

      spy.mockRestore();
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await setupExistingUserTag('developer', [testData.taggerPubky], true);
      await setupUserCounts(testData.taggedPubky, 1, 1);
    });

    it('should delete tag and update counts', async () => {
      await setupUserCounts(testData.taggerPubky, 0, 0, 1);

      await Core.LocalUserTagService.delete({
        taggedId: testData.taggedPubky,
        label: 'developer',
        taggerId: testData.taggerPubky,
      });

      const savedTags = await getSavedUserTags();
      const taggedCounts = await getSavedUserCounts(testData.taggedPubky);
      const taggerCounts = await getSavedUserCounts(testData.taggerPubky);

      expect(savedTags!.tags).toHaveLength(0);
      expect(taggedCounts!.tags).toBe(0);
      expect(taggedCounts!.unique_tags).toBe(0);
      expect(taggerCounts!.tagged).toBe(0);
    });

    it('should remove only tagger when others exist', async () => {
      await setupExistingUserTag('developer', [testData.taggerPubky, testData.anotherTaggerPubky], true);

      await Core.LocalUserTagService.delete({
        taggedId: testData.taggedPubky,
        label: 'developer',
        taggerId: testData.taggerPubky,
      });

      const savedTags = await getSavedUserTags();
      expect(savedTags!.tags[0].taggers_count).toBe(1);
      expect(savedTags!.tags[0].taggers).not.toContain(testData.taggerPubky);
    });

    it('should NOT update unique_tags when removing tagger but others remain', async () => {
      // Setup: Multiple taggers tag the same person with the same label
      await setupExistingUserTag('developer', [testData.taggerPubky, testData.anotherTaggerPubky], true);
      await setupUserCounts(testData.taggedPubky, 1, 1);

      // Remove first tagger - should NOT decrement unique_tags (other tagger remains)
      await Core.LocalUserTagService.delete({
        taggedId: testData.taggedPubky,
        label: 'developer',
        taggerId: testData.taggerPubky,
      });
      const savedCounts = await getSavedUserCounts(testData.taggedPubky);
      expect(savedCounts!.unique_tags).toBe(1); // Should remain 1
    });

    it('should update unique_tags when removing last tagger', async () => {
      // Setup: Single tagger tags the same person with the same label
      await setupExistingUserTag('developer', [testData.taggerPubky], true);
      await setupUserCounts(testData.taggedPubky, 1, 1);

      // Remove the tagger - should decrement unique_tags (last tagger removed)
      await Core.LocalUserTagService.delete({
        taggedId: testData.taggedPubky,
        label: 'developer',
        taggerId: testData.taggerPubky,
      });
      const savedCounts = await getSavedUserCounts(testData.taggedPubky);
      expect(savedCounts!.unique_tags).toBe(0);
    });

    it('should throw error for invalid operations', async () => {
      await Core.UserTagsModel.table.clear();

      await expect(
        Core.LocalUserTagService.delete({
          taggedId: testData.taggedPubky,
          label: 'developer',
          taggerId: testData.taggerPubky,
        }),
      ).rejects.toThrow('Failed to delete user tag');
    });
  });
});
