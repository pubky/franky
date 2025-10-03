import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';

const mockHomeserver = {
  fetch: vi.fn().mockResolvedValue({ ok: true }),
};

vi.mock('pubky-app-specs', () => ({
  PubkySpecsBuilder: class {
    createTag(_uri: string, label: string) {
      return {
        tag: { label, toJson: () => ({ label }) },
        meta: { url: `pubky://tagger/pub/pubky.app/tags/${label}` },
      };
    }
  },
  postUriBuilder: (authorId: string, postId: string) => `pubky://${authorId}/pub/pubky.app/posts/${postId}`,
}));

describe('TagController', () => {
  const validAuthorPubky = 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy' as Core.Pubky;
  const validTaggerPubky = 'o1gg96ewuojmopcjbz8895478wdtxtzzuxnfjjz8o8e77csa1ngo' as Core.Pubky;
  const validPostId = 'abc123xyz';

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    mockHomeserver.fetch.mockClear();

    vi.doMock('@/core', async () => {
      const actual = await vi.importActual('@/core');
      return {
        ...actual,
        HomeserverService: {
          getInstance: vi.fn(() => mockHomeserver),
          request: vi.fn(async () => undefined),
        },
      };
    });

    await Core.db.initialize();
    await Core.db.transaction('rw', [Core.PostTagsModel.table, Core.PostCountsModel.table], async () => {
      await Core.PostTagsModel.table.clear();
      await Core.PostCountsModel.table.clear();
    });
  });

  describe('create', () => {
    it('exists and is callable', async () => {
      const { TagController } = await import('./tag');
      expect(TagController.create).toBeTypeOf('function');
    });

    it('saves tag to database and syncs to homeserver', async () => {
      mockHomeserver.fetch.mockResolvedValueOnce({ ok: true });

      const { TagController } = await import('./tag');
      await TagController.create({
        targetId: `${validAuthorPubky}:${validPostId}`,
        label: 'javascript',
        taggerId: validTaggerPubky,
      });

      const savedTags = await Core.PostTagsModel.table.get(`${validAuthorPubky}:${validPostId}`);
      expect(savedTags).toBeTruthy();
      expect(savedTags!.tags).toHaveLength(1);
      expect(savedTags!.tags[0].label).toBe('javascript');
      expect(savedTags!.tags[0].taggers_count).toBe(1);
      expect(savedTags!.tags[0].relationship).toBe(true);
    });

    it('trims whitespace and converts to lowercase', async () => {
      mockHomeserver.fetch.mockResolvedValueOnce({ ok: true });

      const { TagController } = await import('./tag');
      await TagController.create({
        targetId: `${validAuthorPubky}:${validPostId}`,
        label: '  JavaScript  ',
        taggerId: validTaggerPubky,
      });

      const savedTags = await Core.PostTagsModel.table.get(`${validAuthorPubky}:${validPostId}`);
      expect(savedTags!.tags[0].label).toBe('javascript');
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await Core.PostTagsModel.insert({
        id: `${validAuthorPubky}:${validPostId}`,
        tags: [
          {
            label: 'javascript',
            taggers: [validTaggerPubky],
            taggers_count: 1,
            relationship: true,
          },
        ],
      });
    });

    it('exists and is callable', async () => {
      const { TagController } = await import('./tag');
      expect(TagController.delete).toBeTypeOf('function');
    });

    it('removes tag from database and syncs to homeserver', async () => {
      mockHomeserver.fetch.mockResolvedValueOnce({ ok: true });

      const { TagController } = await import('./tag');
      await TagController.delete({
        targetId: `${validAuthorPubky}:${validPostId}`,
        label: 'javascript',
        taggerId: validTaggerPubky,
      });

      const savedTags = await Core.PostTagsModel.table.get(`${validAuthorPubky}:${validPostId}`);
      expect(savedTags!.tags).toHaveLength(0);
    });

    it('trims whitespace and converts to lowercase', async () => {
      mockHomeserver.fetch.mockResolvedValueOnce({ ok: true });

      const { TagController } = await import('./tag');
      await TagController.delete({
        targetId: `${validAuthorPubky}:${validPostId}`,
        label: '  JavaScript  ',
        taggerId: validTaggerPubky,
      });

      const savedTags = await Core.PostTagsModel.table.get(`${validAuthorPubky}:${validPostId}`);
      expect(savedTags!.tags).toHaveLength(0);
    });
  });
});
