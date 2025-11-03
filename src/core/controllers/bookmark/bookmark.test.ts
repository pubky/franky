import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BookmarkController } from './bookmark';
import * as Core from '@/core';

const mockAuthStore = (pubky: Core.Pubky) => {
  const selectCurrentUserPubky = vi.fn(() => pubky);
  vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue({
    selectCurrentUserPubky,
  } as unknown as import('@/core/stores/auth/auth.types').AuthStore);
  return selectCurrentUserPubky;
};

describe('BookmarkController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('add', () => {
    it('should get pubky from auth store, normalize bookmark, and delegate to BookmarkApplication.add', async () => {
      const postUrl = 'https://example.com/post/123';
      const pubky = 'pubky-user' as unknown as Core.Pubky;
      const mockBookmark = {
        meta: { url: postUrl, id: 'bookmark-id' },
        bookmark: { uri: postUrl, toJson: () => ({}) },
      } as unknown as import('pubky-app-specs').BookmarkResult;

      // Mock auth store
      const selectCurrentUserPubky = mockAuthStore(pubky);

      // Mock normalizer
      const toSpy = vi.spyOn(Core.BookmarkNormalizer, 'to').mockResolvedValue(mockBookmark);

      // Mock application
      const addSpy = vi.spyOn(Core.BookmarkApplication, 'add').mockResolvedValue(undefined);

      await BookmarkController.add({ postUrl });

      expect(selectCurrentUserPubky).toHaveBeenCalled();
      expect(toSpy).toHaveBeenCalledWith({ pubky, postUrl });
      expect(addSpy).toHaveBeenCalledWith(mockBookmark);
    });

    it('should bubble when BookmarkNormalizer.to fails and not delegate', async () => {
      const postUrl = 'https://example.com/post/123';
      const pubky = 'pubky-user' as unknown as Core.Pubky;

      mockAuthStore(pubky);

      vi.spyOn(Core.BookmarkNormalizer, 'to').mockRejectedValue(new Error('normalize-fail'));
      const addSpy = vi.spyOn(Core.BookmarkApplication, 'add').mockResolvedValue(undefined);

      await expect(BookmarkController.add({ postUrl })).rejects.toThrow('normalize-fail');

      expect(addSpy).not.toHaveBeenCalled();
    });

    it('should bubble when BookmarkApplication.add fails', async () => {
      const postUrl = 'https://example.com/post/123';
      const pubky = 'pubky-user' as unknown as Core.Pubky;
      const mockBookmark = {
        meta: { url: postUrl, id: 'bookmark-id' },
        bookmark: { uri: postUrl },
      } as unknown as import('pubky-app-specs').BookmarkResult;

      mockAuthStore(pubky);

      vi.spyOn(Core.BookmarkNormalizer, 'to').mockResolvedValue(mockBookmark);
      vi.spyOn(Core.BookmarkApplication, 'add').mockRejectedValue(new Error('delegate-fail'));

      await expect(BookmarkController.add({ postUrl })).rejects.toThrow('delegate-fail');
    });
  });

  describe('delete', () => {
    it('should delegate to BookmarkApplication.delete', async () => {
      const postUrl = 'https://example.com/post/123';
      const authorPubky = 'pubky-user' as unknown as Core.Pubky;

      const deleteSpy = vi.spyOn(Core.BookmarkApplication, 'delete').mockResolvedValue(undefined);

      // Mock auth store
      const selectCurrentUserPubky = mockAuthStore(authorPubky);

      await BookmarkController.delete({ postUrl });

      expect(selectCurrentUserPubky).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalledWith({ postUrl, authorPubky });
    });

    it('should bubble when BookmarkApplication.delete fails', async () => {
      const postUrl = 'https://example.com/post/123';
      const authorPubky = 'pubky-user' as unknown as Core.Pubky;

      // Mock auth store
      mockAuthStore(authorPubky);

      vi.spyOn(Core.BookmarkApplication, 'delete').mockRejectedValue(new Error('delete-fail'));

      await expect(BookmarkController.delete({ postUrl })).rejects.toThrow('delete-fail');
    });
  });
});
