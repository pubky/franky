import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BookmarkApplication } from './bookmark';
import * as Core from '@/core';
import type { BookmarkResult } from 'pubky-app-specs';

// Mock the LocalBookmarkService
vi.mock('@/core/services/local/bookmark', () => ({
  LocalBookmarkService: {
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the HomeserverService
vi.mock('@/core/services/homeserver', () => ({
  HomeserverService: {
    request: vi.fn(),
  },
}));

describe('BookmarkApplication', () => {
  // Test data factory
  const createMockBookmark = (): BookmarkResult => {
    const postUrl = 'https://example.com/post/123';
    return {
      meta: { url: postUrl, id: 'bookmark-id' },
      bookmark: { uri: postUrl, toJson: () => ({}) },
    } as unknown as BookmarkResult;
  };

  // Helper functions
  const setupMocks = () => ({
    createSpy: vi.spyOn(Core.LocalBookmarkService, 'create'),
    deleteSpy: vi.spyOn(Core.LocalBookmarkService, 'delete'),
    requestSpy: vi.spyOn(Core.HomeserverService, 'request'),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('add', () => {
    it('should save locally and sync to homeserver successfully', async () => {
      const mockBookmark = createMockBookmark();
      const { createSpy, requestSpy } = setupMocks();

      createSpy.mockResolvedValue(undefined);
      requestSpy.mockResolvedValue(undefined);

      await BookmarkApplication.add(mockBookmark);

      expect(createSpy).toHaveBeenCalledWith(mockBookmark);
      expect(requestSpy).toHaveBeenCalledWith(
        Core.HomeserverAction.PUT,
        mockBookmark.meta.url,
        mockBookmark.bookmark.toJson(),
      );
    });

    it('should throw when local save fails', async () => {
      const mockBookmark = createMockBookmark();
      const { createSpy, requestSpy } = setupMocks();

      createSpy.mockRejectedValue(new Error('Database error'));

      await expect(BookmarkApplication.add(mockBookmark)).rejects.toThrow('Database error');
      expect(createSpy).toHaveBeenCalledOnce();
      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('should throw when homeserver sync fails', async () => {
      const mockBookmark = createMockBookmark();
      const { createSpy, requestSpy } = setupMocks();

      createSpy.mockResolvedValue(undefined);
      requestSpy.mockRejectedValue(new Error('Failed to PUT to homeserver: 500'));

      await expect(BookmarkApplication.add(mockBookmark)).rejects.toThrow('Failed to PUT to homeserver: 500');
      expect(createSpy).toHaveBeenCalledOnce();
      expect(requestSpy).toHaveBeenCalledOnce();
    });
  });

  describe('delete', () => {
    it('should remove locally and sync to homeserver successfully', async () => {
      const postUrl = 'https://example.com/post/123';
      const { deleteSpy, requestSpy } = setupMocks();

      deleteSpy.mockResolvedValue(undefined);
      requestSpy.mockResolvedValue(undefined);

      await BookmarkApplication.delete({ postUrl });

      expect(deleteSpy).toHaveBeenCalledWith({ postUrl });
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.DELETE, postUrl);
    });

    it('should throw when local delete fails', async () => {
      const postUrl = 'https://example.com/post/123';
      const { deleteSpy, requestSpy } = setupMocks();

      deleteSpy.mockRejectedValue(new Error('Bookmark not found'));

      await expect(BookmarkApplication.delete({ postUrl })).rejects.toThrow('Bookmark not found');
      expect(deleteSpy).toHaveBeenCalledOnce();
      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('should throw when homeserver sync fails', async () => {
      const postUrl = 'https://example.com/post/123';
      const { deleteSpy, requestSpy } = setupMocks();

      deleteSpy.mockResolvedValue(undefined);
      requestSpy.mockRejectedValue(new Error('Failed to DELETE from homeserver: 404'));

      await expect(BookmarkApplication.delete({ postUrl })).rejects.toThrow('Failed to DELETE from homeserver: 404');
      expect(deleteSpy).toHaveBeenCalledOnce();
      expect(requestSpy).toHaveBeenCalledOnce();
    });
  });
});
