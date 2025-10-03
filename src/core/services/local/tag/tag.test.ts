import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('LocalTagService', () => {
  const validAuthorPubky = 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy' as Core.Pubky;
  const validTaggerPubky = 'o1gg96ewuojmopcjbz8895478wdtxtzzuxnfjjz8o8e77csa1ngo' as Core.Pubky;
  const validPostId = `${validAuthorPubky}:abc123xyz`;

  beforeEach(async () => {
    await Core.db.initialize();
    await Core.db.transaction('rw', [Core.PostTagsModel.table, Core.PostCountsModel.table], async () => {
      await Core.PostTagsModel.table.clear();
      await Core.PostCountsModel.table.clear();
    });
  });

  describe('save', () => {
    it('should save a new tag to a post', async () => {
      await Core.Local.Tag.save({
        postId: validPostId,
        label: 'javascript',
        taggerId: validTaggerPubky,
      });

      const savedTags = await Core.PostTagsModel.table.get(validPostId);
      expect(savedTags).toBeTruthy();
      expect(savedTags!.tags).toHaveLength(1);
      expect(savedTags!.tags[0].label).toBe('javascript');
      expect(savedTags!.tags[0].taggers_count).toBe(1);
      expect(savedTags!.tags[0].relationship).toBe(true);
    });

    it('should add tagger to existing tag', async () => {
      const anotherTaggerPubky = 'y4euc88xboik1ev3axy9m9ajuedo8gx1mh1n7ms8zoxm5s1b1h9y' as Core.Pubky;

      await Core.Local.Tag.save({
        postId: validPostId,
        label: 'javascript',
        taggerId: validTaggerPubky,
      });

      await Core.PostTagsModel.insert({
        id: validPostId,
        tags: [
          {
            label: 'javascript',
            taggers: [validTaggerPubky],
            taggers_count: 1,
            relationship: false,
          },
        ],
      });

      await Core.Local.Tag.save({
        postId: validPostId,
        label: 'javascript',
        taggerId: anotherTaggerPubky,
      });

      const savedTags = await Core.PostTagsModel.table.get(validPostId);
      expect(savedTags!.tags[0].taggers_count).toBe(2);
      expect(savedTags!.tags[0].relationship).toBe(true);
    });

    it('should throw error if user already tagged post with this label', async () => {
      await Core.PostTagsModel.insert({
        id: validPostId,
        tags: [
          {
            label: 'javascript',
            taggers: [validTaggerPubky],
            taggers_count: 1,
            relationship: true,
          },
        ],
      });

      await expect(
        Core.Local.Tag.save({
          postId: validPostId,
          label: 'javascript',
          taggerId: validTaggerPubky,
        }),
      ).rejects.toThrow('User already tagged this post with this label');
    });

    it('should update post counts when adding tag', async () => {
      await Core.PostCountsModel.insert({
        id: validPostId,
        replies: 0,
        tags: 0,
        unique_tags: 0,
        reposts: 0,
      });

      await Core.Local.Tag.save({
        postId: validPostId,
        label: 'javascript',
        taggerId: validTaggerPubky,
      });

      const savedCounts = await Core.PostCountsModel.table.get(validPostId);
      expect(savedCounts!.tags).toBe(1);
      expect(savedCounts!.unique_tags).toBe(1);
    });

    it('should add multiple different tags to a post', async () => {
      await Core.Local.Tag.save({
        postId: validPostId,
        label: 'javascript',
        taggerId: validTaggerPubky,
      });

      await Core.Local.Tag.save({
        postId: validPostId,
        label: 'react',
        taggerId: validTaggerPubky,
      });

      const savedTags = await Core.PostTagsModel.table.get(validPostId);
      expect(savedTags!.tags).toHaveLength(2);
      expect(savedTags!.tags.map((t) => t.label)).toContain('javascript');
      expect(savedTags!.tags.map((t) => t.label)).toContain('react');
    });
  });

  describe('remove', () => {
    beforeEach(async () => {
      await Core.PostTagsModel.insert({
        id: validPostId,
        tags: [
          {
            label: 'javascript',
            taggers: [validTaggerPubky],
            taggers_count: 1,
            relationship: true,
          },
        ],
      });

      await Core.PostCountsModel.insert({
        id: validPostId,
        replies: 0,
        tags: 1,
        unique_tags: 1,
        reposts: 0,
      });
    });

    it('should remove tag from post', async () => {
      await Core.Local.Tag.remove({
        postId: validPostId,
        label: 'javascript',
        taggerId: validTaggerPubky,
      });

      const savedTags = await Core.PostTagsModel.table.get(validPostId);
      expect(savedTags!.tags).toHaveLength(0);
    });

    it('should update post counts when removing tag', async () => {
      await Core.Local.Tag.remove({
        postId: validPostId,
        label: 'javascript',
        taggerId: validTaggerPubky,
      });

      const savedCounts = await Core.PostCountsModel.table.get(validPostId);
      expect(savedCounts!.tags).toBe(0);
      expect(savedCounts!.unique_tags).toBe(0);
    });

    it('should throw error if post has no tags', async () => {
      await Core.PostTagsModel.table.clear();

      await expect(
        Core.Local.Tag.remove({
          postId: validPostId,
          label: 'javascript',
          taggerId: validTaggerPubky,
        }),
      ).rejects.toThrow('Post has no tags');
    });

    it('should throw error if user has not tagged post with this label', async () => {
      await Core.PostTagsModel.insert({
        id: validPostId,
        tags: [
          {
            label: 'javascript',
            taggers: [validTaggerPubky],
            taggers_count: 1,
            relationship: false,
          },
        ],
      });

      await expect(
        Core.Local.Tag.remove({
          postId: validPostId,
          label: 'javascript',
          taggerId: validTaggerPubky,
        }),
      ).rejects.toThrow('User has not tagged this post with this label');
    });

    it('should remove only the tagger but keep tag if other taggers exist', async () => {
      const anotherTaggerPubky = 'y4euc88xboik1ev3axy9m9ajuedo8gx1mh1n7ms8zoxm5s1b1h9y' as Core.Pubky;

      await Core.PostTagsModel.insert({
        id: validPostId,
        tags: [
          {
            label: 'javascript',
            taggers: [validTaggerPubky, anotherTaggerPubky],
            taggers_count: 2,
            relationship: true,
          },
        ],
      });

      await Core.Local.Tag.remove({
        postId: validPostId,
        label: 'javascript',
        taggerId: validTaggerPubky,
      });

      const savedTags = await Core.PostTagsModel.table.get(validPostId);
      expect(savedTags!.tags).toHaveLength(1);
      expect(savedTags!.tags[0].taggers_count).toBe(1);
      expect(savedTags!.tags[0].relationship).toBe(false);
      expect(savedTags!.tags[0].taggers).toContain(anotherTaggerPubky);
      expect(savedTags!.tags[0].taggers).not.toContain(validTaggerPubky);
    });
  });
});
