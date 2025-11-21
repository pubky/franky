import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import type { TBookmarkEventParams } from './bookmark.types';

// Mock pubky-app-specs
vi.mock('pubky-app-specs', () => ({
  PubkySpecsBuilder: class {
    constructor(public pubky: string) {}
    createBookmark(uri: string) {
      return {
        bookmark: { toJson: () => ({ uri }), free: () => {} },
        meta: { url: `pubky://${this.pubky}/pub/pubky.app/bookmarks/${Date.now()}` },
        free: () => {},
      };
    }
  },
  postUriBuilder: (authorId: string, postId: string) => `pubky://${authorId}/pub/pubky.app/posts/${postId}`,
}));

// Test data
const testData = {
  userPubky: 'o1gg96ewuojmopcjbz8895478wdtxtzzuxnfjjz8o8e77csa1ngo' as Core.Pubky,
  authorPubky: 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy' as Core.Pubky,
  postId: 'abc123xyz',
  get compositePostId() {
    return Core.buildCompositeId({ pubky: this.authorPubky, id: this.postId });
  },
};

// Helper functions
const createBookmarkParams = (): TBookmarkEventParams => ({
  userId: testData.userPubky,
  postId: testData.compositePostId,
});

describe('BookmarkController', () => {
  let BookmarkController: typeof import('./bookmark').BookmarkController;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock BookmarkApplication
    vi.spyOn(Core.BookmarkApplication, 'persist').mockResolvedValue(undefined);

    // Import BookmarkController
    const bookmarkModule = await import('./bookmark');
    BookmarkController = bookmarkModule.BookmarkController;
  });

  describe('create', () => {
    it('should call BookmarkApplication.persist with correct parameters', async () => {
      const persistSpy = vi.spyOn(Core.BookmarkApplication, 'persist');

      await BookmarkController.create(createBookmarkParams());

      expect(persistSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, {
        postId: testData.compositePostId,
        bookmarkUrl: expect.stringContaining('pubky://'),
        bookmarkJson: expect.objectContaining({ uri: expect.any(String) }),
      });
    });
  });

  describe('delete', () => {
    it('should call BookmarkApplication.persist with correct parameters', async () => {
      const persistSpy = vi.spyOn(Core.BookmarkApplication, 'persist');

      await BookmarkController.delete(createBookmarkParams());

      expect(persistSpy).toHaveBeenCalledWith(Core.HomeserverAction.DELETE, {
        postId: testData.compositePostId,
        bookmarkUrl: expect.stringContaining('pubky://'),
      });
    });
  });
});
