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

      expect(mockFetch).toHaveBeenCalledWith(Core.bootstrapApi.get(pubky), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should persist users to the database', async () => {
      const mockResponse = generateMockResponse(pubky, '');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await Core.NexusBootstrapService.retrieveAndPersist(pubky);

      // Verify user details were persisted to database
      const savedUserDetails = await Core.UserDetailsModel.findById(pubky);
      expect(savedUserDetails).toBeTruthy();
      expect(savedUserDetails.id).toBe(pubky);
      expect(savedUserDetails.name).toBe('Bootstrap User');
      expect(savedUserDetails.bio).toBe('Bootstrap bio');

      // Verify user counts were persisted to database
      const savedUserCounts = await Core.UserCountsModel.findById(pubky);
      expect(savedUserCounts).toBeTruthy();
      expect(savedUserCounts.id).toBe(pubky);
      expect(savedUserCounts.posts).toBe(1);

      // Verify user relationships were persisted to database
      const savedUserRelationships = await Core.UserRelationshipsModel.findById(pubky);
      expect(savedUserRelationships).toBeTruthy();
      expect(savedUserRelationships.id).toBe(pubky);
      expect(savedUserRelationships.following).toBe(false);
      expect(savedUserRelationships.followed_by).toBe(false);
      expect(savedUserRelationships.muted).toBe(false);

      // Verify user tags were persisted to database
      const savedUserTags = await Core.UserTagsModel.findById(pubky);
      expect(savedUserTags).toBeTruthy();
      expect(savedUserTags.id).toBe(pubky);
      expect(savedUserTags.tags).toHaveLength(2);
      expect(savedUserTags.tags[0].label).toBe('developer');
      expect(savedUserTags.tags[0].taggers_count).toBe(2);
      expect(savedUserTags.tags[1].label).toBe('p2p');
      expect(savedUserTags.tags[1].taggers_count).toBe(1);
    });

    it('should persist posts to the database', async () => {
      const testPostId = 'test-post-123';
      const mockResponse = generateMockResponse(pubky, testPostId);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await Core.NexusBootstrapService.retrieveAndPersist(pubky);

      // Create composite ID as done in bootstrap service
      const compositePostId = `${pubky}:${testPostId}`;

      // Verify post details were persisted to database
      const savedPostDetails = await Core.PostDetailsModel.findById(compositePostId);
      expect(savedPostDetails).toBeTruthy();
      expect(savedPostDetails.id).toBe(compositePostId);
      expect(savedPostDetails.content).toBe('Bootstrap post content');

      // Verify post counts were persisted to database
      const savedPostCounts = await Core.PostCountsModel.findById(compositePostId);
      expect(savedPostCounts).toBeTruthy();
      expect(savedPostCounts.id).toBe(compositePostId);
      expect(savedPostCounts.replies).toBe(0);
      expect(savedPostCounts.reposts).toBe(0);

      // Verify post tags were persisted to database
      const savedPostTags = await Core.PostTagsModel.findById(compositePostId);
      expect(savedPostTags).toBeTruthy();
      expect(savedPostTags.id).toBe(compositePostId);
      expect(savedPostTags.tags).toHaveLength(2);
      expect(savedPostTags.tags[0].label).toBe('tech');
      expect(savedPostTags.tags[0].taggers_count).toBe(1);
      expect(savedPostTags.tags[1].label).toBe('announcement');
      expect(savedPostTags.tags[1].taggers_count).toBe(2);
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
      const savedStream = await Core.PostStreamModel.findById(Core.PostStreamTypes.TIMELINE_ALL);
      expect(savedStream).toBeTruthy();
      expect(savedStream!.id).toBe(Core.PostStreamTypes.TIMELINE_ALL);
      expect(savedStream!.posts).toEqual([headPostId, randomPostId]);
      expect(savedStream!.name).toBeNull(); // Stream name should be null as per the service call
    });

    it('should create user streams for influencers and recommended users', async () => {
      const mockResponse = generateMockResponse(pubky, 'test-post-id');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await Core.NexusBootstrapService.retrieveAndPersist(pubky);

      // Verify influencers stream was created
      const savedInfluencersStream = await Core.UserStreamModel.findById(Core.UserStreamTypes.TODAY_INFLUENCERS_ALL);
      expect(savedInfluencersStream).toBeTruthy();
      expect(savedInfluencersStream!.id).toBe(Core.UserStreamTypes.TODAY_INFLUENCERS_ALL);
      expect(savedInfluencersStream!.users).toEqual(['influencer-user-1', 'influencer-user-2']);

      // Verify recommended stream was created
      const savedRecommendedStream = await Core.UserStreamModel.findById(Core.UserStreamTypes.RECOMMENDED);
      expect(savedRecommendedStream).toBeTruthy();
      expect(savedRecommendedStream!.id).toBe(Core.UserStreamTypes.RECOMMENDED);
      expect(savedRecommendedStream!.users).toEqual(['recommended-user-1', 'recommended-user-2', 'recommended-user-3']);
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
      const savedUserDetails = await Core.UserDetailsModel.findById(testUserId);
      expect(savedUserDetails).toBeTruthy();
      expect(savedUserDetails.name).toBe('Bootstrap User');

      const savedUserCounts = await Core.UserCountsModel.findById(testUserId);
      expect(savedUserCounts).toBeTruthy();

      const savedUserRelationships = await Core.UserRelationshipsModel.findById(testUserId);
      expect(savedUserRelationships).toBeTruthy();

      const savedUserTags = await Core.UserTagsModel.findById(testUserId);
      expect(savedUserTags).toBeTruthy();

      // Verify post details were persisted
      const compositePostId = `${testUserId}:${testPostId}`;
      const savedPostDetails = await Core.PostDetailsModel.findById(compositePostId);
      expect(savedPostDetails).toBeTruthy();
      expect(savedPostDetails.content).toBe('Bootstrap post content');

      // Verify post counts were persisted
      const savedPostCounts = await Core.PostCountsModel.findById(compositePostId);
      expect(savedPostCounts).toBeTruthy();

      // Verify post tags were persisted
      const savedPostTags = await Core.PostTagsModel.findById(compositePostId);
      expect(savedPostTags).toBeTruthy();

      const savedStream = await Core.PostStreamModel.findById(Core.PostStreamTypes.TIMELINE_ALL);
      expect(savedStream).toBeTruthy();
      expect(savedStream!.posts).toEqual([testPostId, 'random-post-id']);

      // Verify user streams were created
      const savedInfluencersStream = await Core.UserStreamModel.findById(Core.UserStreamTypes.TODAY_INFLUENCERS_ALL);
      expect(savedInfluencersStream).toBeTruthy();
      expect(savedInfluencersStream!.users).toEqual(['influencer-user-1', 'influencer-user-2']);

      const savedRecommendedStream = await Core.UserStreamModel.findById(Core.UserStreamTypes.RECOMMENDED);
      expect(savedRecommendedStream).toBeTruthy();
      expect(savedRecommendedStream!.users).toEqual(['recommended-user-1', 'recommended-user-2', 'recommended-user-3']);

      // Verify fetch was called correctly
      expect(mockFetch).toHaveBeenCalledWith(Core.bootstrapApi.get(pubky), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
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
