import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

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
const createBookmarkParams = (): Core.TBookmarkEventParams => ({
  userId: testData.userPubky,
  postId: testData.compositePostId,
});

const getSavedBookmark = async () => {
  return await Core.BookmarkModel.table.get(testData.compositePostId);
};

const getUserCounts = async (userId: Core.Pubky) => {
  return await Core.UserCountsModel.table.get(userId);
};

const getStream = async (streamId: Core.PostStreamTypes) => {
  return await Core.PostStreamModel.table.get(streamId);
};

const setupExistingBookmark = async () => {
  await Core.BookmarkModel.upsert({
    id: testData.compositePostId,
    created_at: Date.now(),
  });
};

const setupUserCounts = async (userId: Core.Pubky, bookmarks: number = 0) => {
  await Core.UserCountsModel.upsert({
    id: userId,
    bookmarks,
    tagged: 0,
    tags: 0,
    unique_tags: 0,
    posts: 0,
    replies: 0,
    following: 0,
    followers: 0,
    friends: 0,
  });
};

const setupPostDetails = async (kind: 'short' | 'long', attachments?: string[], content?: string) => {
  await Core.PostDetailsModel.upsert({
    id: testData.compositePostId,
    content: content || 'Test post content',
    kind,
    indexed_at: Date.now(),
    attachments,
  });
};

describe('LocalBookmarkService', () => {
  beforeEach(async () => {
    await Core.db.initialize();
    await Core.db.transaction(
      'rw',
      [Core.BookmarkModel.table, Core.UserCountsModel.table, Core.PostStreamModel.table, Core.PostDetailsModel.table],
      async () => {
        await Core.BookmarkModel.table.clear();
        await Core.UserCountsModel.table.clear();
        await Core.PostStreamModel.table.clear();
        await Core.PostDetailsModel.table.clear();
      },
    );
  });

  describe('create', () => {
    it('should create a new bookmark', async () => {
      await setupUserCounts(testData.userPubky, 0);
      await Core.LocalBookmarkService.create(createBookmarkParams());

      const savedBookmark = await getSavedBookmark();
      expect(savedBookmark).toBeTruthy();
      expect(savedBookmark!.id).toBe(testData.compositePostId);
      expect(savedBookmark!.created_at).toBeGreaterThan(0);
    });

    it('should ignore if post is already bookmarked', async () => {
      await setupExistingBookmark();
      const firstBookmark = await getSavedBookmark();

      await Core.LocalBookmarkService.create(createBookmarkParams());

      const secondBookmark = await getSavedBookmark();
      expect(secondBookmark!.created_at).toBe(firstBookmark!.created_at); // Should remain unchanged
    });

    it('should increment user bookmarks count when creating bookmark', async () => {
      await setupUserCounts(testData.userPubky, 0);
      await Core.LocalBookmarkService.create(createBookmarkParams());

      const userCounts = await getUserCounts(testData.userPubky);
      expect(userCounts!.bookmarks).toBe(1);
    });

    it('should increment user bookmarks count from existing value', async () => {
      await setupUserCounts(testData.userPubky, 5);
      await Core.LocalBookmarkService.create(createBookmarkParams());

      const userCounts = await getUserCounts(testData.userPubky);
      expect(userCounts!.bookmarks).toBe(6);
    });

    it('should add post to TIMELINE_BOOKMARKS_ALL stream', async () => {
      await setupPostDetails('short');
      await Core.LocalBookmarkService.create(createBookmarkParams());

      const stream = await getStream(Core.PostStreamTypes.TIMELINE_BOOKMARKS_ALL);
      expect(stream).toBeTruthy();
      expect(stream!.stream).toContain(testData.compositePostId);
    });

    it('should add short post to TIMELINE_BOOKMARKS_SHORT stream', async () => {
      await setupPostDetails('short');
      await Core.LocalBookmarkService.create(createBookmarkParams());

      const stream = await getStream(Core.PostStreamTypes.TIMELINE_BOOKMARKS_SHORT);
      expect(stream).toBeTruthy();
      expect(stream!.stream).toContain(testData.compositePostId);
    });

    it('should add long post to TIMELINE_BOOKMARKS_LONG stream', async () => {
      await setupPostDetails('long');
      await Core.LocalBookmarkService.create(createBookmarkParams());

      const stream = await getStream(Core.PostStreamTypes.TIMELINE_BOOKMARKS_LONG);
      expect(stream).toBeTruthy();
      expect(stream!.stream).toContain(testData.compositePostId);
    });

    it('should add post with image to TIMELINE_BOOKMARKS_IMAGE stream', async () => {
      await setupPostDetails('short', ['https://example.com/photo.jpg']);
      await Core.LocalBookmarkService.create(createBookmarkParams());

      const stream = await getStream(Core.PostStreamTypes.TIMELINE_BOOKMARKS_IMAGE);
      expect(stream).toBeTruthy();
      expect(stream!.stream).toContain(testData.compositePostId);
    });

    it('should add post with video to TIMELINE_BOOKMARKS_VIDEO stream', async () => {
      await setupPostDetails('short', ['https://example.com/video.mp4']);
      await Core.LocalBookmarkService.create(createBookmarkParams());

      const stream = await getStream(Core.PostStreamTypes.TIMELINE_BOOKMARKS_VIDEO);
      expect(stream).toBeTruthy();
      expect(stream!.stream).toContain(testData.compositePostId);
    });

    it('should add post with file attachment to TIMELINE_BOOKMARKS_FILE stream', async () => {
      await setupPostDetails('short', ['https://example.com/document.pdf']);
      await Core.LocalBookmarkService.create(createBookmarkParams());

      const stream = await getStream(Core.PostStreamTypes.TIMELINE_BOOKMARKS_FILE);
      expect(stream).toBeTruthy();
      expect(stream!.stream).toContain(testData.compositePostId);
    });

    it('should add post with link to TIMELINE_BOOKMARKS_LINK stream', async () => {
      await setupPostDetails('short', undefined, 'Check out https://example.com for more info');
      await Core.LocalBookmarkService.create(createBookmarkParams());

      const stream = await getStream(Core.PostStreamTypes.TIMELINE_BOOKMARKS_LINK);
      expect(stream).toBeTruthy();
      expect(stream!.stream).toContain(testData.compositePostId);
    });

    it('should add post to multiple streams based on content', async () => {
      await setupPostDetails('short', ['https://example.com/photo.jpg'], 'Visit https://example.com');
      await Core.LocalBookmarkService.create(createBookmarkParams());

      const allStream = await getStream(Core.PostStreamTypes.TIMELINE_BOOKMARKS_ALL);
      const shortStream = await getStream(Core.PostStreamTypes.TIMELINE_BOOKMARKS_SHORT);
      const imageStream = await getStream(Core.PostStreamTypes.TIMELINE_BOOKMARKS_IMAGE);
      const linkStream = await getStream(Core.PostStreamTypes.TIMELINE_BOOKMARKS_LINK);

      expect(allStream!.stream).toContain(testData.compositePostId);
      expect(shortStream!.stream).toContain(testData.compositePostId);
      expect(imageStream!.stream).toContain(testData.compositePostId);
      expect(linkStream!.stream).toContain(testData.compositePostId);
    });

    it('should not update counts when post is already bookmarked', async () => {
      await setupExistingBookmark();
      await setupUserCounts(testData.userPubky, 5);
      await setupPostDetails('short');

      await Core.LocalBookmarkService.create(createBookmarkParams());

      const userCounts = await getUserCounts(testData.userPubky);
      expect(userCounts!.bookmarks).toBe(5); // Should remain unchanged
    });

    it('should detect multiple image formats', async () => {
      await setupPostDetails('short', ['photo.jpg', 'image.png', 'graphic.webp', 'animation.gif']);
      await Core.LocalBookmarkService.create(createBookmarkParams());

      const stream = await getStream(Core.PostStreamTypes.TIMELINE_BOOKMARKS_IMAGE);
      expect(stream!.stream).toContain(testData.compositePostId);
    });

    it('should detect multiple video formats', async () => {
      await setupPostDetails('short', ['video.mp4', 'clip.webm', 'movie.mov']);
      await Core.LocalBookmarkService.create(createBookmarkParams());

      const stream = await getStream(Core.PostStreamTypes.TIMELINE_BOOKMARKS_VIDEO);
      expect(stream!.stream).toContain(testData.compositePostId);
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await setupExistingBookmark();
      await setupPostDetails('short');
      await Core.LocalStreamPostsService.prependToStream(
        Core.PostStreamTypes.TIMELINE_BOOKMARKS_ALL,
        testData.compositePostId,
      );
    });

    it('should delete bookmark from database', async () => {
      await Core.LocalBookmarkService.delete(createBookmarkParams());

      const savedBookmark = await getSavedBookmark();
      expect(savedBookmark).toBeUndefined();
    });

    it('should decrement user bookmarks count when deleting bookmark', async () => {
      await setupUserCounts(testData.userPubky, 1);
      await Core.LocalBookmarkService.delete(createBookmarkParams());

      const userCounts = await getUserCounts(testData.userPubky);
      expect(userCounts!.bookmarks).toBe(0);
    });

    it('should decrement user bookmarks count from existing value', async () => {
      await setupUserCounts(testData.userPubky, 10);
      await Core.LocalBookmarkService.delete(createBookmarkParams());

      const userCounts = await getUserCounts(testData.userPubky);
      expect(userCounts!.bookmarks).toBe(9);
    });

    it('should remove post from all bookmark streams', async () => {
      await Core.LocalStreamPostsService.prependToStream(
        Core.PostStreamTypes.TIMELINE_BOOKMARKS_SHORT,
        testData.compositePostId,
      );
      await Core.LocalStreamPostsService.prependToStream(
        Core.PostStreamTypes.TIMELINE_BOOKMARKS_LONG,
        testData.compositePostId,
      );

      await Core.LocalBookmarkService.delete(createBookmarkParams());

      const allStream = await getStream(Core.PostStreamTypes.TIMELINE_BOOKMARKS_ALL);
      const shortStream = await getStream(Core.PostStreamTypes.TIMELINE_BOOKMARKS_SHORT);
      const longStream = await getStream(Core.PostStreamTypes.TIMELINE_BOOKMARKS_LONG);

      expect(allStream!.stream).not.toContain(testData.compositePostId);
      expect(shortStream!.stream).not.toContain(testData.compositePostId);
      expect(longStream!.stream).not.toContain(testData.compositePostId);
    });

    it('should ignore if post is not bookmarked', async () => {
      await Core.BookmarkModel.table.clear();

      // Should not throw
      await Core.LocalBookmarkService.delete(createBookmarkParams());

      const savedBookmark = await getSavedBookmark();
      expect(savedBookmark).toBeUndefined();
    });

    it('should not update counts when post is not bookmarked', async () => {
      await Core.BookmarkModel.table.clear();
      await setupUserCounts(testData.userPubky, 5);

      await Core.LocalBookmarkService.delete(createBookmarkParams());

      const userCounts = await getUserCounts(testData.userPubky);
      expect(userCounts!.bookmarks).toBe(5); // Should remain unchanged
    });
  });

  describe('exists', () => {
    it('should return true if post is bookmarked', async () => {
      await setupExistingBookmark();

      const exists = await Core.LocalBookmarkService.exists(testData.compositePostId);
      expect(exists).toBe(true);
    });

    it('should return false if post is not bookmarked', async () => {
      // Use a different post ID to ensure no collision with previous test
      const nonExistentPostId = 'nonexistent:post123';
      const exists = await Core.LocalBookmarkService.exists(nonExistentPostId);
      expect(exists).toBe(false);
    });
  });

  describe('getAllBookmarks', () => {
    it('should return all bookmarked post IDs', async () => {
      const postId1 = 'author1:post1';
      const postId2 = 'author2:post2';
      const postId3 = 'author3:post3';

      await Core.BookmarkModel.upsert({ id: postId1, created_at: Date.now() });
      await Core.BookmarkModel.upsert({ id: postId2, created_at: Date.now() });
      await Core.BookmarkModel.upsert({ id: postId3, created_at: Date.now() });

      const bookmarks = await Core.LocalBookmarkService.getAllBookmarks();
      expect(bookmarks).toHaveLength(3);
      expect(bookmarks).toContain(postId1);
      expect(bookmarks).toContain(postId2);
      expect(bookmarks).toContain(postId3);
    });

    it('should return empty array when no bookmarks exist', async () => {
      const bookmarks = await Core.LocalBookmarkService.getAllBookmarks();
      expect(bookmarks).toEqual([]);
    });
  });
});
