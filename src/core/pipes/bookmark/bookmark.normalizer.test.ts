import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { BookmarkResult, PubkySpecsBuilder, postUriBuilder } from 'pubky-app-specs';

// Shared test data across all test suites
const testData = {
  userId: 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy' as Core.Pubky,
  authorPubky1: 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy' as Core.Pubky,
  authorPubky2: 'o1gg96ewuojmopcjbz8895478wdtxtzzuxnfjjz8o8e77csa1ngo' as Core.Pubky,
  postId1: '0032PARTQP4G0',
  postId2: '0032QASXZ1230',
  postId3: '0032TESTID789',
};

describe('BookmarkNormalizer', () => {
  /**
   * Unit Tests - Mock the PubkySpecsSingleton to test BookmarkNormalizer in isolation
   */
  describe('Unit Tests', () => {
    // Mock builder factory
    const createMockBuilder = (overrides?: Partial<{ createBookmark: ReturnType<typeof vi.fn> }>) => ({
      createBookmark: vi.fn((uri: string) => {
        const mockBookmark = {
          uri,
          toJson: vi.fn(() => ({ uri })),
        };
        return {
          bookmark: mockBookmark,
          meta: { url: `pubky://${testData.userId}/pub/pubky.app/bookmarks/${Date.now()}` },
        } as unknown as BookmarkResult;
      }),
      ...overrides,
    });

    let mockBuilder: ReturnType<typeof createMockBuilder>;

    // Helper to create a mock post URI
    const createMockPostUri = (authorPubky = testData.authorPubky1, postId = testData.postId1) =>
      `pubky://${authorPubky}/pub/pubky.app/posts/${postId}`;

    beforeEach(() => {
      vi.clearAllMocks();
      mockBuilder = createMockBuilder();
      vi.spyOn(Core.PubkySpecsSingleton, 'get').mockReturnValue(mockBuilder as unknown as PubkySpecsBuilder);
      vi.spyOn(Libs.Logger, 'debug').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe('to', () => {
      describe('successful bookmark creation', () => {
        it('should create bookmark with valid inputs', () => {
          const postUri = createMockPostUri();
          const result = Core.BookmarkNormalizer.to(postUri, testData.userId);

          expect(result).toBeTruthy();
          expect(result).toHaveProperty('bookmark');
          expect(result).toHaveProperty('meta');
          expect(Libs.Logger.debug).toHaveBeenCalledWith('Bookmark validated', { result });
        });

        it('should call PubkySpecsSingleton.get with correct userId', () => {
          const postUri = createMockPostUri();
          Core.BookmarkNormalizer.to(postUri, testData.userId);

          expect(Core.PubkySpecsSingleton.get).toHaveBeenCalledWith(testData.userId);
        });

        it('should call builder.createBookmark with correct postUri', () => {
          const postUri = createMockPostUri();
          Core.BookmarkNormalizer.to(postUri, testData.userId);

          expect(mockBuilder.createBookmark).toHaveBeenCalledWith(postUri);
        });

        it('should return BookmarkResult with correct structure', () => {
          const postUri = createMockPostUri();
          const result = Core.BookmarkNormalizer.to(postUri, testData.userId);

          expect(result.bookmark).toBeDefined();
          expect(result.bookmark).toHaveProperty('toJson');
          expect(typeof result.bookmark.toJson).toBe('function');
          expect(result.meta).toBeDefined();
          expect(result.meta).toHaveProperty('url');
          expect(typeof result.meta.url).toBe('string');
        });

        it('should have bookmark URL containing pubky protocol', () => {
          const postUri = createMockPostUri();
          const result = Core.BookmarkNormalizer.to(postUri, testData.userId);

          expect(result.meta.url).toContain('pubky://');
        });

        it('should have bookmark JSON with correct URI', () => {
          const postUri = createMockPostUri();
          const result = Core.BookmarkNormalizer.to(postUri, testData.userId);

          const bookmarkJson = result.bookmark.toJson();
          expect(bookmarkJson).toBeDefined();
          expect(typeof bookmarkJson).toBe('object');
          expect(bookmarkJson).toHaveProperty('uri');
          expect(bookmarkJson.uri).toBe(postUri);
        });
      });

      describe('different input variations', () => {
        it('should handle different author pubkys', () => {
          const uri1 = createMockPostUri(testData.authorPubky1, testData.postId1);
          const uri2 = createMockPostUri(testData.authorPubky2, testData.postId1);

          Core.BookmarkNormalizer.to(uri1, testData.userId);
          expect(mockBuilder.createBookmark).toHaveBeenCalledWith(uri1);

          Core.BookmarkNormalizer.to(uri2, testData.userId);
          expect(mockBuilder.createBookmark).toHaveBeenCalledWith(uri2);
        });

        it('should handle different post IDs', () => {
          const uris = [
            createMockPostUri(testData.authorPubky1, testData.postId1),
            createMockPostUri(testData.authorPubky1, testData.postId2),
            createMockPostUri(testData.authorPubky1, testData.postId3),
          ];

          uris.forEach((uri) => {
            Core.BookmarkNormalizer.to(uri, testData.userId);
            expect(mockBuilder.createBookmark).toHaveBeenCalledWith(uri);
          });

          expect(mockBuilder.createBookmark).toHaveBeenCalledTimes(3);
        });

        it('should handle different userIds', () => {
          const postUri = createMockPostUri();

          Core.BookmarkNormalizer.to(postUri, testData.authorPubky1);
          expect(Core.PubkySpecsSingleton.get).toHaveBeenCalledWith(testData.authorPubky1);

          Core.BookmarkNormalizer.to(postUri, testData.authorPubky2);
          expect(Core.PubkySpecsSingleton.get).toHaveBeenCalledWith(testData.authorPubky2);
        });
      });

      describe('error handling', () => {
        it('should propagate errors from builder.createBookmark', () => {
          mockBuilder.createBookmark.mockImplementation(() => {
            throw new Error('Invalid bookmark URI');
          });

          expect(() => Core.BookmarkNormalizer.to('invalid-uri', testData.userId)).toThrow('Invalid bookmark URI');
        });

        it('should propagate errors from PubkySpecsSingleton.get', () => {
          vi.spyOn(Core.PubkySpecsSingleton, 'get').mockImplementation(() => {
            throw new Error('Invalid pubky');
          });

          expect(() => Core.BookmarkNormalizer.to(createMockPostUri(), testData.userId)).toThrow('Invalid pubky');
        });

        it('should not call logger when builder throws', () => {
          mockBuilder.createBookmark.mockImplementation(() => {
            throw new Error('Builder error');
          });

          expect(() => Core.BookmarkNormalizer.to(createMockPostUri(), testData.userId)).toThrow();
          expect(Libs.Logger.debug).not.toHaveBeenCalled();
        });
      });

      describe('edge cases', () => {
        it('should pass empty string postUri to builder', () => {
          Core.BookmarkNormalizer.to('', testData.userId);
          expect(mockBuilder.createBookmark).toHaveBeenCalledWith('');
        });

        it('should pass postUri with special characters to builder', () => {
          const specialUri = 'pubky://author/pub/pubky.app/posts/post-123_test.456';
          Core.BookmarkNormalizer.to(specialUri, testData.userId);
          expect(mockBuilder.createBookmark).toHaveBeenCalledWith(specialUri);
        });

        it('should pass postUri with query parameters to builder', () => {
          const uriWithParams = `${createMockPostUri()}?param=value`;
          Core.BookmarkNormalizer.to(uriWithParams, testData.userId);
          expect(mockBuilder.createBookmark).toHaveBeenCalledWith(uriWithParams);
        });

        it('should handle very long post URIs', () => {
          const longPostId = 'a'.repeat(1000);
          const longUri = createMockPostUri(testData.authorPubky1, longPostId);
          Core.BookmarkNormalizer.to(longUri, testData.userId);
          expect(mockBuilder.createBookmark).toHaveBeenCalledWith(longUri);
        });
      });
    });
  });

  /**
   * Integration Tests - Use real pubky-app-specs library to verify actual behavior
   */
  describe('Integration Tests', () => {
    // Helper to create a valid post URI using the real library
    const createPostUri = (authorPubky = testData.authorPubky1, postId = testData.postId1) =>
      postUriBuilder(authorPubky, postId);

    beforeEach(() => {
      vi.spyOn(Libs.Logger, 'debug').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe('successful bookmark creation with real specs library', () => {
      it('should create valid bookmark result', () => {
        const postUri = createPostUri();
        const result = Core.BookmarkNormalizer.to(postUri, testData.userId);

        expect(result).toBeDefined();
        expect(result.bookmark).toBeDefined();
        expect(result.meta).toBeDefined();
      });

      it('should generate bookmark URL with correct format', () => {
        const postUri = createPostUri();
        const result = Core.BookmarkNormalizer.to(postUri, testData.userId);

        // Verify URL follows pubky bookmark pattern
        expect(result.meta.url).toMatch(/^pubky:\/\/.+\/pub\/pubky\.app\/bookmarks\/.+/);
        expect(result.meta.url).toContain(testData.userId);
      });

      it('should store correct post URI in bookmark JSON', () => {
        const postUri = createPostUri();
        const result = Core.BookmarkNormalizer.to(postUri, testData.userId);

        const bookmarkJson = result.bookmark.toJson();
        expect(bookmarkJson.uri).toBe(postUri);
      });

      it('should handle bookmarking posts from different authors', () => {
        const uri1 = createPostUri(testData.authorPubky1, testData.postId1);
        const uri2 = createPostUri(testData.authorPubky2, testData.postId2);

        const result1 = Core.BookmarkNormalizer.to(uri1, testData.userId);
        const result2 = Core.BookmarkNormalizer.to(uri2, testData.userId);

        expect(result1.bookmark.toJson().uri).toBe(uri1);
        expect(result2.bookmark.toJson().uri).toBe(uri2);
        expect(result1.bookmark.toJson().uri).not.toBe(result2.bookmark.toJson().uri);
      });

      it('should create unique bookmark URLs for different posts', () => {
        const uri1 = createPostUri(testData.authorPubky1, testData.postId1);
        const uri2 = createPostUri(testData.authorPubky1, testData.postId2);

        const result1 = Core.BookmarkNormalizer.to(uri1, testData.userId);
        const result2 = Core.BookmarkNormalizer.to(uri2, testData.userId);

        // Different posts should have different bookmark URLs
        expect(result1.meta.url).not.toBe(result2.meta.url);
      });
    });

    describe('validation with real specs library', () => {
      it('should throw error for empty post URI', () => {
        expect(() => Core.BookmarkNormalizer.to('', testData.userId)).toThrow();
      });

      it('should throw error for null post URI', () => {
        expect(() => Core.BookmarkNormalizer.to(null as unknown as string, testData.userId)).toThrow();
      });

      it('should throw error for undefined post URI', () => {
        expect(() => Core.BookmarkNormalizer.to(undefined as unknown as string, testData.userId)).toThrow();
      });

      /**
       * Note: The pubky-app-specs library is permissive with URI validation.
       * These tests document actual library behavior - URIs are stored as-is
       * without strict protocol or structure validation.
       */
      it('should accept URI without pubky protocol (library is permissive)', () => {
        const result = Core.BookmarkNormalizer.to('http://example/pub/pubky.app/posts/post123', testData.userId);
        expect(result).toBeDefined();
        expect(result.bookmark.toJson().uri).toBe('http://example/pub/pubky.app/posts/post123');
      });

      it('should accept URI with incomplete structure (library is permissive)', () => {
        const result = Core.BookmarkNormalizer.to('pubky://somevalue', testData.userId);
        expect(result).toBeDefined();
        expect(result.bookmark.toJson().uri).toBe('pubky://somevalue');
      });
    });

    describe('bookmark JSON structure validation', () => {
      it('should have uri property in bookmark JSON', () => {
        const postUri = createPostUri();
        const result = Core.BookmarkNormalizer.to(postUri, testData.userId);

        const bookmarkJson = result.bookmark.toJson();
        expect(bookmarkJson).toHaveProperty('uri');
        expect(typeof bookmarkJson.uri).toBe('string');
      });

      it('should preserve exact post URI in bookmark', () => {
        const postUri = createPostUri(testData.authorPubky2, testData.postId3);
        const result = Core.BookmarkNormalizer.to(postUri, testData.userId);

        expect(result.bookmark.toJson().uri).toBe(postUri);
      });
    });
  });
});
