import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';

describe('NexusBootstrapService', () => {
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
          tagged: 2,
          tags: 2,
          unique_tags: 2,
          posts: 1,
          replies: 0,
          following: 0,
          followers: 0,
          friends: 0,
          bookmarks: 0,
        },
        tags: [
          {
            label: 'developer',
            taggers: ['tagger-user-1', 'tagger-user-2'],
            taggers_count: 2,
            relationship: false,
          },
          {
            label: 'p2p',
            taggers: ['tagger-user-3'],
            taggers_count: 1,
            relationship: false,
          },
        ],
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
          uri: `https://pubky.app/${testUserId}/pub/pubky.app/posts/${testPostId}`,
          author: testUserId,
          indexed_at: Date.now(),
          attachments: null,
        },
        counts: {
          replies: 0,
          tags: 2,
          unique_tags: 2,
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
            tagged: 2,
            tags: 2,
            unique_tags: 2,
            posts: 1,
            replies: 0,
            following: 0,
            followers: 0,
            friends: 0,
            bookmarks: 0,
          },
          tags: [
            {
              label: 'developer',
              taggers: ['tagger-user-1', 'tagger-user-2'],
              taggers_count: 2,
              relationship: false,
            },
            {
              label: 'p2p',
              taggers: ['tagger-user-3'],
              taggers_count: 1,
              relationship: false,
            },
          ],
          relationship: {
            following: false,
            followed_by: false,
            muted: false,
          },
        },
        tags: [
          {
            label: 'tech',
            taggers: ['post-tagger-1'],
            taggers_count: 1,
            relationship: false,
          },
          {
            label: 'announcement',
            taggers: ['post-tagger-2', 'post-tagger-3'],
            taggers_count: 2,
            relationship: false,
          },
        ],
        relationships: {
          replied: null,
          reposted: null,
          mentioned: [],
        },
        bookmark: null,
      },
    ],
    list: {
      stream: [testPostId, 'random-post-id'],
      influencers: ['influencer-user-1', 'influencer-user-2'],
      recommended: ['recommended-user-1', 'recommended-user-2', 'recommended-user-3'],
      hot_tags: [],
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  describe('read', () => {
    it('should fetch and return bootstrap data successfully', async () => {
      const mockResponse = generateMockResponse(pubky, '');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await Core.NexusBootstrapService.fetch(pubky);

      expect(mockFetch).toHaveBeenCalledWith(Core.bootstrapApi.get(pubky), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw INVALID_REQUEST error on 400', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(Core.NexusBootstrapService.fetch(pubky)).rejects.toMatchObject({
        type: Libs.NexusErrorType.INVALID_REQUEST,
        statusCode: 400,
        details: expect.objectContaining({
          statusCode: 400,
          statusText: 'Bad Request',
        }),
      });
    });

    it('should throw RESOURCE_NOT_FOUND error on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(Core.NexusBootstrapService.fetch(pubky)).rejects.toMatchObject({
        type: Libs.NexusErrorType.RESOURCE_NOT_FOUND,
        statusCode: 404,
      });
    });

    it('should throw INVALID_RESPONSE error on invalid JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(Core.NexusBootstrapService.fetch(pubky)).rejects.toMatchObject({
        type: Libs.NexusErrorType.INVALID_RESPONSE,
        statusCode: 500,
        details: expect.objectContaining({
          error: expect.any(Error),
        }),
      });
    });

    it('should throw error on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(Core.NexusBootstrapService.fetch(pubky)).rejects.toThrow('Network failure');
    });

    it('should throw RATE_LIMIT_EXCEEDED on 429', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      await expect(Core.NexusBootstrapService.fetch(pubky)).rejects.toMatchObject({
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

      await expect(Core.NexusBootstrapService.fetch(pubky)).rejects.toMatchObject({
        type: Libs.NexusErrorType.SERVICE_UNAVAILABLE,
        statusCode: 503,
      });
    });
  });
});
