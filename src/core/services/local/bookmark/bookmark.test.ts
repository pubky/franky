import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { LocalBookmarkService } from './bookmark';
import type { BookmarkResult } from 'pubky-app-specs';

// Test data
const testData = {
  userId: 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy' as Core.Pubky,
  postId: 'abc123xyz',
  get fullPostId() {
    return Core.buildPostCompositeId({ pubky: this.userId, postId: this.postId });
  },
  postUrl: 'https://example.com/post/123',
  bookmarkId: 'bookmark-id-123',
};

// Helper functions
const createMockBookmark = (): BookmarkResult => {
  const uri = `pubky://${testData.userId}/pub/pubky.app/posts/${testData.postId}`;
  const url = `pubky://${testData.userId}/pub/pubky.app/bookmarks/${testData.bookmarkId}`;
  return {
    meta: { url, id: testData.bookmarkId },
    bookmark: { uri, toJson: () => ({}) },
  } as unknown as BookmarkResult;
};

const getSavedBookmark = async (postId: string) => {
  return await Core.BookmarkModel.table.get(postId);
};

const getUserCounts = async (userId: Core.Pubky) => {
  return await Core.UserCountsModel.table.get(userId);
};

const setupUserCounts = async (userId: Core.Pubky, bookmarks: number = 0) => {
  const userCounts: Core.UserCountsModelSchema = {
    id: userId,
    tagged: 0,
    tags: 0,
    unique_tags: 0,
    posts: 0,
    replies: 0,
    following: 0,
    followers: 0,
    friends: 0,
    bookmarks,
  };
  await Core.UserCountsModel.table.add(userCounts);
};

describe('LocalBookmarkService', () => {
  beforeEach(async () => {
    await Core.db.initialize();
    await Core.db.transaction('rw', [Core.BookmarkModel.table, Core.UserCountsModel.table], async () => {
      await Core.BookmarkModel.table.clear();
      await Core.UserCountsModel.table.clear();
    });
  });

  describe('create', () => {
    it('should create bookmark and increment user bookmarks count', async () => {
      await setupUserCounts(testData.userId, 5);
      const mockBookmark = createMockBookmark();

      await LocalBookmarkService.create(mockBookmark);

      const savedBookmark = await getSavedBookmark(testData.fullPostId);
      expect(savedBookmark).toBeTruthy();
      expect(savedBookmark!.id).toBe(testData.fullPostId);
      expect(savedBookmark!.bookmark_id).toBe(testData.bookmarkId);

      const userCounts = await getUserCounts(testData.userId);
      expect(userCounts!.bookmarks).toBe(6);
    });

    it('should upsert existing bookmark (idempotent)', async () => {
      await setupUserCounts(testData.userId, 0);
      const mockBookmark = createMockBookmark();

      await LocalBookmarkService.create(mockBookmark);
      await LocalBookmarkService.create(mockBookmark);

      const savedBookmark = await getSavedBookmark(testData.fullPostId);
      expect(savedBookmark).toBeTruthy();
      const userCounts = await getUserCounts(testData.userId);
      expect(userCounts!.bookmarks).toBe(1);
    });

    it('should handle when user counts record does not exist', async () => {
      const mockBookmark = createMockBookmark();

      await LocalBookmarkService.create(mockBookmark);

      const savedBookmark = await getSavedBookmark(testData.fullPostId);
      expect(savedBookmark).toBeTruthy();
      // updateCounts returns early if userCounts doesn't exist
      const userCounts = await getUserCounts(testData.userId);
      expect(userCounts).toBeUndefined();
    });

    it('should rollback transaction on error', async () => {
      await setupUserCounts(testData.userId, 0);
      const spy = vi.spyOn(Core.BookmarkModel, 'upsert').mockRejectedValueOnce(new Error('Database error'));

      try {
        await expect(LocalBookmarkService.create(createMockBookmark())).rejects.toMatchObject({
          type: Libs.DatabaseErrorType.SAVE_FAILED,
          statusCode: 500,
        });

        expect(await getSavedBookmark(testData.fullPostId)).toBeUndefined();
        const userCounts = await getUserCounts(testData.userId);
        expect(userCounts!.bookmarks).toBe(0);
      } finally {
        spy.mockRestore();
      }
    });

    it('should handle when buildPostIdFromPubkyUri returns null', async () => {
      await setupUserCounts(testData.userId, 0);
      const invalidBookmark = {
        meta: { url: `pubky://${testData.userId}/pub/pubky.app/bookmarks/id`, id: 'id' },
        bookmark: { uri: 'invalid-uri', toJson: () => ({}) },
      } as unknown as BookmarkResult;

      // Will fail during upsert since postId is null
      await expect(LocalBookmarkService.create(invalidBookmark)).rejects.toMatchObject({
        type: Libs.DatabaseErrorType.SAVE_FAILED,
      });
    });

    it('should persist only one bookmark row after repeated creates', async () => {
      await setupUserCounts(testData.userId, 0);
      const mockBookmark = createMockBookmark();

      await LocalBookmarkService.create(mockBookmark);
      await LocalBookmarkService.create(mockBookmark);

      const rows = await Core.BookmarkModel.table.count();
      expect(rows).toBe(1);
    });

    it('should rollback when counts update fails and not persist bookmark', async () => {
      await setupUserCounts(testData.userId, 0);
      const mockBookmark = createMockBookmark();
      const spy = vi.spyOn(Core.UserCountsModel, 'updateCounts').mockRejectedValueOnce(new Error('Database error'));

      try {
        await expect(LocalBookmarkService.create(mockBookmark)).rejects.toMatchObject({
          type: Libs.DatabaseErrorType.SAVE_FAILED,
          statusCode: 500,
        });

        const saved = await getSavedBookmark(testData.fullPostId);
        expect(saved).toBeUndefined();
        const userCounts = await getUserCounts(testData.userId);
        expect(userCounts!.bookmarks).toBe(0);
      } finally {
        spy.mockRestore();
      }
    });
  });

  describe('delete', () => {
    const postUrl = `pubky://${testData.userId}/pub/pubky.app/posts/${testData.postId}`;

    beforeEach(async () => {
      // Setup bookmark for delete tests
      await LocalBookmarkService.create(createMockBookmark());
    });

    it('should delete bookmark and decrement user bookmarks count', async () => {
      await setupUserCounts(testData.userId, 5);

      await LocalBookmarkService.delete({ postUrl, authorPubky: testData.userId });

      expect(await getSavedBookmark(testData.fullPostId)).toBeUndefined();
      const userCounts = await getUserCounts(testData.userId);
      expect(userCounts!.bookmarks).toBe(4);
    });

    it('should throw DELETE_FAILED when postId cannot be generated', async () => {
      await expect(
        LocalBookmarkService.delete({ postUrl: 'invalid-url', authorPubky: testData.userId }),
      ).rejects.toMatchObject({
        type: Libs.DatabaseErrorType.DELETE_FAILED,
        statusCode: 500,
      });
    });

    it('should handle deletion of non-existent bookmark gracefully', async () => {
      await setupUserCounts(testData.userId, 0);
      const nonExistentUrl = `pubky://${testData.userId}/pub/pubky.app/posts/nonexistent`;

      // Should not throw, deleteById on non-existent is idempotent
      await expect(
        LocalBookmarkService.delete({ postUrl: nonExistentUrl, authorPubky: testData.userId }),
      ).resolves.not.toThrow();
    });

    it('should rollback transaction on error', async () => {
      // Setup user counts before creating bookmark in beforeEach
      await setupUserCounts(testData.userId, 0);

      // Recreate bookmark so it increments the count
      await Core.BookmarkModel.table.clear();
      await LocalBookmarkService.create(createMockBookmark());

      const spy = vi.spyOn(Core.BookmarkModel, 'deleteById').mockRejectedValueOnce(new Error('Database error'));

      try {
        await expect(LocalBookmarkService.delete({ postUrl, authorPubky: testData.userId })).rejects.toMatchObject({
          type: Libs.DatabaseErrorType.DELETE_FAILED,
          statusCode: 500,
        });

        expect(await getSavedBookmark(testData.fullPostId)).toBeTruthy();
        const userCounts = await getUserCounts(testData.userId);
        expect(userCounts!.bookmarks).toBe(1); // Still incremented from create, not decremented
      } finally {
        spy.mockRestore();
      }
    });

    it('should handle when user counts record does not exist', async () => {
      await Core.UserCountsModel.table.clear();

      await expect(LocalBookmarkService.delete({ postUrl, authorPubky: testData.userId })).resolves.not.toThrow();
      expect(await getSavedBookmark(testData.fullPostId)).toBeUndefined();
    });

    it('should not decrement below zero', async () => {
      await setupUserCounts(testData.userId, 0);

      await LocalBookmarkService.delete({ postUrl, authorPubky: testData.userId });

      const userCounts = await getUserCounts(testData.userId);
      expect(userCounts!.bookmarks).toBe(0);
    });

    it('should not decrement counts for non-existent bookmark when counts exist', async () => {
      await setupUserCounts(testData.userId, 3);
      const nonExistentUrl = `pubky://${testData.userId}/pub/pubky.app/posts/nonexistent-xyz`;

      await expect(
        LocalBookmarkService.delete({ postUrl: nonExistentUrl, authorPubky: testData.userId }),
      ).resolves.not.toThrow();

      const userCounts = await getUserCounts(testData.userId);
      expect(userCounts!.bookmarks).toBe(3);
    });

    it('should rollback when counts update fails and not delete bookmark', async () => {
      // Ensure counts exist and bookmark exists
      await setupUserCounts(testData.userId, 0);
      await Core.BookmarkModel.table.clear();
      await LocalBookmarkService.create(createMockBookmark());

      const spy = vi.spyOn(Core.UserCountsModel, 'updateCounts').mockRejectedValueOnce(new Error('Database error'));

      try {
        await expect(LocalBookmarkService.delete({ postUrl, authorPubky: testData.userId })).rejects.toMatchObject({
          type: Libs.DatabaseErrorType.DELETE_FAILED,
          statusCode: 500,
        });

        // Bookmark should still exist and counts should be unchanged
        expect(await getSavedBookmark(testData.fullPostId)).toBeTruthy();
        const userCounts = await getUserCounts(testData.userId);
        expect(userCounts!.bookmarks).toBe(1);
      } finally {
        spy.mockRestore();
      }
    });
  });
});
