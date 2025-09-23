import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';

describe('NexusService', () => {
  const mockFetch = vi.fn();
  const pubky = 'test-user-123';

  const generateMockResponse = (testUserId: string, testPostId: string) => ({
    users: [
      {
        details: {
          name: 'Bootstrap User',
          bio: 'Bootstrap bio',
          id: testUserId,
          links: null,
          status: null,
          image: null,
          indexed_at: Date.now(),
        },
        counts: {
          tagged: 0,
          tags: 0,
          unique_tags: 0,
          posts: 1,
          replies: 0,
          following: 0,
          followers: 0,
          friends: 0,
          bookmarks: 0,
        },
        tags: [],
        relationship: {
          following: false,
          followed_by: false,
          muted: false,
        },
      },
    ],
    posts: [
      {
        details: {
          id: testPostId,
          content: 'Bootstrap post content',
          kind: 'short',
          parent: null,
          root: null,
          author: testUserId,
          indexed_at: Date.now(),
          attachments: [],
        },
        counts: {
          replies: 0,
          tags: 0,
          reposts: 0,
        },
        author: {
          details: {
            name: 'Bootstrap User',
            bio: 'Bootstrap bio',
            id: testUserId,
            links: null,
            status: null,
            image: null,
            indexed_at: Date.now(),
          },
          counts: {
            tagged: 0,
            tags: 0,
            unique_tags: 0,
            posts: 1,
            replies: 0,
            following: 0,
            followers: 0,
            friends: 0,
            bookmarks: 0,
          },
          tags: [],
          relationship: {
            following: false,
            followed_by: false,
            muted: false,
          },
        },
        tags: [],
        relationships: {
          replied: false,
          reposted: false,
        },
        bookmark: null,
      },
    ],
    list: {
      stream: [testPostId, 'random-post-id'],
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  describe('bootstrap', () => {
    it('should fetch and return bootstrap data successfully', async () => {
      const mockResponse = generateMockResponse(pubky, '');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await Core.NexusBootstrapService.retrieveAndPersist(pubky);

      expect(mockFetch).toHaveBeenCalledWith(`https://nexus.staging.pubky.app/v0/bootstrap/${pubky}`);
    });

    it('should persist users to the database', async () => {
      const mockResponse = generateMockResponse(pubky, '');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await Core.NexusBootstrapService.retrieveAndPersist(pubky);

      // Verify user was persisted to database
      const savedUser = await Core.UserModel.findById(pubky);
      expect(savedUser).toBeTruthy();
      expect(savedUser.details.id).toBe(pubky);
      expect(savedUser.details.name).toBe('Bootstrap User');
      expect(savedUser.details.bio).toBe('Bootstrap bio');
    });

    it('should persist posts to the database', async () => {
      const testPostId = 'test-post-123';
      const mockResponse = generateMockResponse(pubky, testPostId);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await Core.NexusBootstrapService.retrieveAndPersist(pubky);

      // Verify post was persisted to database
      const savedPost = await Core.PostModel.findById(testPostId);
      expect(savedPost).toBeTruthy();
      expect(savedPost.details.id).toBe(testPostId);
      expect(savedPost.details.content).toBe('Bootstrap post content');
      expect(savedPost.details.author).toBe(pubky);
    });

    it('should create stream in the database', async () => {
      const headPostId = 'head-post-id';
      const randomPostId = 'random-post-id';
      const mockResponse = generateMockResponse(pubky, 'head-post-id');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await Core.NexusBootstrapService.retrieveAndPersist(pubky);

      // Verify stream was created in database
      const savedStream = await Core.StreamModel.findById(Core.StreamTypes.TIMELINE_ALL);
      expect(savedStream).toBeTruthy();
      expect(savedStream!.id).toBe(Core.StreamTypes.TIMELINE_ALL);
      expect(savedStream!.posts).toEqual([headPostId, randomPostId]);
      expect(savedStream!.name).toBeNull(); // Stream name should be null as per the service call
    });

    it('should persist complete bootstrap data with users, posts, and stream', async () => {
      const testUserId = 'user-123';
      const testPostId = 'post-456';

      const mockResponse = generateMockResponse(testUserId, testPostId);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await Core.NexusBootstrapService.retrieveAndPersist(pubky);

      // Verify all data was persisted
      const savedUser = await Core.UserModel.findById(testUserId);
      expect(savedUser).toBeTruthy();
      expect(savedUser.details.name).toBe('Bootstrap User');

      const savedPost = await Core.PostModel.findById(testPostId);
      expect(savedPost).toBeTruthy();
      expect(savedPost.details.content).toBe('Bootstrap post content');

      const savedStream = await Core.StreamModel.findById(Core.StreamTypes.TIMELINE_ALL);
      expect(savedStream).toBeTruthy();
      expect(savedStream!.posts).toEqual([testPostId, 'random-post-id']);

      // Verify fetch was called correctly
      expect(mockFetch).toHaveBeenCalledWith(`https://nexus.staging.pubky.app/v0/bootstrap/${pubky}`);
    });

    it('should throw INVALID_REQUEST error on 400', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(Core.NexusBootstrapService.retrieveAndPersist(pubky)).rejects.toMatchObject({
        type: Libs.NexusErrorType.INVALID_REQUEST,
        statusCode: 400,
        details: expect.objectContaining({
          pubky,
          statusCode: 400,
        }),
      });
    });

    it('should throw RESOURCE_NOT_FOUND error on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(Core.NexusBootstrapService.retrieveAndPersist(pubky)).rejects.toMatchObject({
        type: Libs.NexusErrorType.RESOURCE_NOT_FOUND,
        statusCode: 404,
      });
    });

    it('should throw INVALID_RESPONSE error on invalid JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(Core.NexusBootstrapService.retrieveAndPersist(pubky)).rejects.toMatchObject({
        type: Libs.NexusErrorType.INVALID_RESPONSE,
        statusCode: 500,
        details: expect.objectContaining({
          pubky,
          error: expect.any(Error),
        }),
      });
    });

    it('should throw NETWORK_ERROR on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(Core.NexusBootstrapService.retrieveAndPersist(pubky)).rejects.toMatchObject({
        type: Libs.NexusErrorType.NETWORK_ERROR,
        statusCode: 500,
        details: expect.objectContaining({
          pubky,
          error: expect.any(Error),
        }),
      });
    });

    it('should throw RATE_LIMIT_EXCEEDED on 429', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      await expect(Core.NexusBootstrapService.retrieveAndPersist(pubky)).rejects.toMatchObject({
        type: Libs.NexusErrorType.RATE_LIMIT_EXCEEDED,
        statusCode: 429,
      });
    });

    it('should throw SERVICE_UNAVAILABLE on 503', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      await expect(Core.NexusBootstrapService.retrieveAndPersist(pubky)).rejects.toMatchObject({
        type: Libs.NexusErrorType.SERVICE_UNAVAILABLE,
        statusCode: 503,
      });
    });
  });
});
