import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookmarkApplication } from './bookmark';
import * as Core from '@/core';
import type { TCreateBookmarkInput, TDeleteBookmarkInput } from './bookmark.types';

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
  const testUserId = 'o1gg96ewuojmopcjbz8895478wdtxtzzuxnfjjz8o8e77csa1ngo' as Core.Pubky;

  // Test data factory
  const createMockBookmarkData = (): TCreateBookmarkInput => ({
    postId: 'author:post123',
    bookmarkUrl: 'pubky://user123/pub/pubky.app/bookmarks/abc',
    bookmarkJson: { uri: 'pubky://author/pub/pubky.app/posts/post123' },
  });

  const createMockDeleteData = (): TDeleteBookmarkInput => ({
    postId: 'author:post123',
    bookmarkUrl: 'pubky://user123/pub/pubky.app/bookmarks/abc',
  });

  // Helper functions
  const setupMocks = () => ({
    createSpy: vi.spyOn(Core.LocalBookmarkService, 'create'),
    deleteSpy: vi.spyOn(Core.LocalBookmarkService, 'delete'),
    requestSpy: vi.spyOn(Core.HomeserverService, 'request'),
    authSpy: vi.spyOn(Core.useAuthStore, 'getState'),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should save locally and sync to homeserver successfully', async () => {
      const mockData = createMockBookmarkData();
      const { createSpy, requestSpy, authSpy } = setupMocks();

      authSpy.mockReturnValue({ currentUserPubky: testUserId });
      createSpy.mockResolvedValue(undefined);
      requestSpy.mockResolvedValue(undefined);

      await BookmarkApplication.create(mockData);

      expect(createSpy).toHaveBeenCalledWith({
        userId: testUserId,
        postId: mockData.postId,
      });
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, mockData.bookmarkUrl, mockData.bookmarkJson);
    });

    it('should throw error when user is not authenticated', async () => {
      const mockData = createMockBookmarkData();
      const { authSpy } = setupMocks();

      // Mock unauthenticated state
      authSpy.mockReturnValue({
        currentUserPubky: null,
      });

      await expect(BookmarkApplication.create(mockData)).rejects.toThrow('User not authenticated');
    });

    it('should throw when local save fails', async () => {
      const mockData = createMockBookmarkData();
      const { createSpy, authSpy } = setupMocks();

      authSpy.mockReturnValue({ currentUserPubky: testUserId });
      createSpy.mockRejectedValue(new Error('Database error'));

      await expect(BookmarkApplication.create(mockData)).rejects.toThrow('Database error');
      expect(createSpy).toHaveBeenCalledOnce();
      // In parallel execution, homeserver request may start before local fails
      // So we just verify it was called, but the overall operation still fails
    });

    it('should throw when homeserver sync fails', async () => {
      const mockData = createMockBookmarkData();
      const { createSpy, requestSpy, authSpy } = setupMocks();

      authSpy.mockReturnValue({ currentUserPubky: testUserId });
      createSpy.mockResolvedValue(undefined);
      requestSpy.mockRejectedValue(new Error('Failed to PUT to homeserver: 500'));

      await expect(BookmarkApplication.create(mockData)).rejects.toThrow('Failed to PUT to homeserver: 500');
      expect(createSpy).toHaveBeenCalledOnce();
      expect(requestSpy).toHaveBeenCalledOnce();
    });
  });

  describe('delete', () => {
    it('should remove locally and sync to homeserver successfully', async () => {
      const mockData = createMockDeleteData();
      const { deleteSpy, requestSpy, authSpy } = setupMocks();

      authSpy.mockReturnValue({ currentUserPubky: testUserId });
      deleteSpy.mockResolvedValue(undefined);
      requestSpy.mockResolvedValue(undefined);

      await BookmarkApplication.delete(mockData);

      expect(deleteSpy).toHaveBeenCalledWith({
        userId: testUserId,
        postId: mockData.postId,
      });
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.DELETE, mockData.bookmarkUrl);
    });

    it('should throw error when user is not authenticated', async () => {
      const mockData = createMockDeleteData();
      const { authSpy } = setupMocks();

      // Mock unauthenticated state
      authSpy.mockReturnValue({
        currentUserPubky: null,
      });

      await expect(BookmarkApplication.delete(mockData)).rejects.toThrow('User not authenticated');
    });

    it('should throw when local remove fails', async () => {
      const mockData = createMockDeleteData();
      const { deleteSpy, authSpy } = setupMocks();

      authSpy.mockReturnValue({ currentUserPubky: testUserId });
      deleteSpy.mockRejectedValue(new Error('Bookmark not found'));

      await expect(BookmarkApplication.delete(mockData)).rejects.toThrow('Bookmark not found');
      expect(deleteSpy).toHaveBeenCalledOnce();
      // In parallel execution, homeserver request may start before local fails
      // So we just verify it was called, but the overall operation still fails
    });

    it('should throw when homeserver sync fails', async () => {
      const mockData = createMockDeleteData();
      const { deleteSpy, requestSpy, authSpy } = setupMocks();

      authSpy.mockReturnValue({ currentUserPubky: testUserId });
      deleteSpy.mockResolvedValue(undefined);
      requestSpy.mockRejectedValue(new Error('Failed to DELETE from homeserver: 404'));

      await expect(BookmarkApplication.delete(mockData)).rejects.toThrow('Failed to DELETE from homeserver: 404');
      expect(deleteSpy).toHaveBeenCalledOnce();
      expect(requestSpy).toHaveBeenCalledOnce();
    });
  });
});
