import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TagResult } from 'pubky-app-specs';
import * as Core from '@/core';
import type { TCreateTagParams, TDeleteTagParams } from './tag.types';

// Mock homeserver
const mockHomeserver = {
  fetch: vi.fn().mockResolvedValue({ ok: true }),
};

// Mock pubky-app-specs
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

// Test data
const testData = {
  authorPubky: 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy' as Core.Pubky,
  taggerPubky: 'o1gg96ewuojmopcjbz8895478wdtxtzzuxnfjjz8o8e77csa1ngo' as Core.Pubky,
  postId: 'abc123xyz',
  get targetId() {
    return Core.buildPostCompositeId({ pubky: this.authorPubky, postId: this.postId });
  },
};

// Helper functions
const createTagParams = (label: string): TCreateTagParams => ({
  targetId: testData.targetId,
  label,
  taggerId: testData.taggerPubky,
});

const deleteTagParams = (label: string): TDeleteTagParams => ({
  targetId: testData.targetId,
  label,
  taggerId: testData.taggerPubky,
});

const getSavedTags = async () => {
  return await Core.PostTagsModel.table.get(testData.targetId);
};

const setupExistingTag = async () => {
  await Core.PostTagsModel.create({
    id: testData.targetId,
    tags: [
      {
        label: 'javascript',
        taggers: [testData.taggerPubky],
        taggers_count: 1,
        relationship: true,
      },
    ],
  });
};

describe('TagController', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    mockHomeserver.fetch.mockClear();

    vi.spyOn(Core.TagNormalizer, 'to').mockImplementation((uri: string, label: string, pubky: Core.Pubky) => {
      return {
        tag: { label, toJson: () => ({ label }), free: vi.fn() },
        meta: { url: `pubky://${pubky}/pub/pubky.app/tags/${label}` },
        free: vi.fn(),
      } as unknown as TagResult;
    });

    // Mock Core module
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

    // Initialize database and clear tables
    await Core.db.initialize();
    await Core.db.transaction('rw', [Core.PostTagsModel.table, Core.PostCountsModel.table], async () => {
      await Core.PostTagsModel.table.clear();
      await Core.PostCountsModel.table.clear();
    });
  });

  describe('create', () => {
    it('should be callable', async () => {
      const { TagController } = await import('./tag');
      expect(TagController.create).toBeTypeOf('function');
    });

    it('should save tag and sync to homeserver', async () => {
      mockHomeserver.fetch.mockResolvedValueOnce({ ok: true });
      const { TagController } = await import('./tag');

      await TagController.create(createTagParams('javascript'));

      const savedTags = await getSavedTags();
      expect(savedTags).toBeTruthy();
      expect(savedTags!.tags).toHaveLength(1);
      expect(savedTags!.tags[0].label).toBe('javascript');
      expect(savedTags!.tags[0].taggers_count).toBe(1);
      expect(savedTags!.tags[0].relationship).toBe(true);
    });

    it('should normalize label (trim and lowercase)', async () => {
      mockHomeserver.fetch.mockResolvedValueOnce({ ok: true });
      const { TagController } = await import('./tag');

      await TagController.create(createTagParams('  JavaScript  '));

      const savedTags = await getSavedTags();
      expect(savedTags!.tags[0].label).toBe('javascript');
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await setupExistingTag();
    });

    it('should be callable', async () => {
      const { TagController } = await import('./tag');
      expect(TagController.delete).toBeTypeOf('function');
    });

    it('should remove tag and sync to homeserver', async () => {
      mockHomeserver.fetch.mockResolvedValueOnce({ ok: true });
      const { TagController } = await import('./tag');

      await TagController.delete(deleteTagParams('javascript'));

      const savedTags = await getSavedTags();
      expect(savedTags!.tags).toHaveLength(0);
    });

    it('should normalize label (trim and lowercase)', async () => {
      mockHomeserver.fetch.mockResolvedValueOnce({ ok: true });
      const { TagController } = await import('./tag');

      await TagController.delete(deleteTagParams('  JavaScript  '));

      const savedTags = await getSavedTags();
      expect(savedTags!.tags).toHaveLength(0);
    });
  });
});
