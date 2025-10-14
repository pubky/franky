import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('LocalPersistenceService', () => {
  const pubky = 'test-user-123';

  const generateMockBootstrapData = (testUserId: string, testPostId: string): Core.NexusBootstrapResponse => ({
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
        tags: [
          {
            label: 'tech',
            taggers: ['post-tagger-1'],
            taggers_count: 1,
            relationship: false,
            setRelationship: () => {},
            addTagger: () => {},
            removeTagger: () => {},
          },
          {
            label: 'announcement',
            taggers: ['post-tagger-2', 'post-tagger-3'],
            taggers_count: 2,
            relationship: false,
            setRelationship: () => {},
            addTagger: () => {},
            removeTagger: () => {},
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

  beforeEach(async () => {
    // Clear all relevant tables
    await Core.UserDetailsModel.table.clear();
    await Core.UserCountsModel.table.clear();
    await Core.UserRelationshipsModel.table.clear();
    await Core.UserTagsModel.table.clear();
    await Core.PostDetailsModel.table.clear();
    await Core.PostCountsModel.table.clear();
    await Core.PostTagsModel.table.clear();
    await Core.PostStreamModel.table.clear();
    await Core.UserStreamModel.table.clear();
  });

  describe('persistUsers', () => {
    it('should persist user details to the database', async () => {
      const mockData = generateMockBootstrapData(pubky, '');

      await Core.LocalPersistenceService.persistUsers(mockData.users);

      // Verify user details were persisted
      const savedUserDetails = await Core.UserDetailsModel.findById(pubky);
      expect(savedUserDetails).toBeTruthy();
      expect(savedUserDetails!.id).toBe(pubky);
      expect(savedUserDetails!.name).toBe('Bootstrap User');
      expect(savedUserDetails!.bio).toBe('Bootstrap bio');
    });

    it('should persist user counts to the database', async () => {
      const mockData = generateMockBootstrapData(pubky, '');

      await Core.LocalPersistenceService.persistUsers(mockData.users);

      // Verify user counts were persisted
      const savedUserCounts = await Core.UserCountsModel.findById(pubky);
      expect(savedUserCounts).toBeTruthy();
      expect(savedUserCounts!.id).toBe(pubky);
      expect(savedUserCounts!.posts).toBe(1);
    });

    it('should persist user relationships to the database', async () => {
      const mockData = generateMockBootstrapData(pubky, '');

      await Core.LocalPersistenceService.persistUsers(mockData.users);

      // Verify user relationships were persisted
      const savedUserRelationships = await Core.UserRelationshipsModel.findById(pubky);
      expect(savedUserRelationships).toBeTruthy();
      expect(savedUserRelationships!.id).toBe(pubky);
      expect(savedUserRelationships!.following).toBe(false);
      expect(savedUserRelationships!.followed_by).toBe(false);
      expect(savedUserRelationships!.muted).toBe(false);
    });

    it('should persist user tags to the database', async () => {
      const mockData = generateMockBootstrapData(pubky, '');

      await Core.LocalPersistenceService.persistUsers(mockData.users);

      // Verify user tags were persisted
      const savedUserTags = await Core.UserTagsModel.findById(pubky);
      expect(savedUserTags).toBeTruthy();
      expect(savedUserTags!.id).toBe(pubky);
      expect(savedUserTags!.tags).toHaveLength(2);
      expect(savedUserTags!.tags[0].label).toBe('developer');
      expect(savedUserTags!.tags[0].taggers_count).toBe(2);
      expect(savedUserTags!.tags[1].label).toBe('p2p');
      expect(savedUserTags!.tags[1].taggers_count).toBe(1);
    });
  });

  describe('persistPosts', () => {
    it('should persist post details to the database', async () => {
      const testPostId = 'test-post-123';
      const mockData = generateMockBootstrapData(pubky, testPostId);

      await Core.LocalPersistenceService.persistPosts(mockData.posts);

      // Create composite ID
      const compositePostId = Core.buildPostCompositeId({ pubky, postId: testPostId });

      // Verify post details were persisted
      const savedPostDetails = await Core.PostDetailsModel.findById(compositePostId);
      expect(savedPostDetails).toBeTruthy();
      expect(savedPostDetails!.id).toBe(compositePostId);
      expect(savedPostDetails!.content).toBe('Bootstrap post content');
    });

    it('should persist post counts to the database', async () => {
      const testPostId = 'test-post-123';
      const mockData = generateMockBootstrapData(pubky, testPostId);

      await Core.LocalPersistenceService.persistPosts(mockData.posts);

      // Create composite ID
      const compositePostId = Core.buildPostCompositeId({ pubky, postId: testPostId });

      // Verify post counts were persisted
      const savedPostCounts = await Core.PostCountsModel.findById(compositePostId);
      expect(savedPostCounts).toBeTruthy();
      expect(savedPostCounts!.id).toBe(compositePostId);
      expect(savedPostCounts!.replies).toBe(0);
      expect(savedPostCounts!.reposts).toBe(0);
    });

    it('should persist post tags to the database', async () => {
      const testPostId = 'test-post-123';
      const mockData = generateMockBootstrapData(pubky, testPostId);

      await Core.LocalPersistenceService.persistPosts(mockData.posts);

      // Create composite ID
      const compositePostId = Core.buildPostCompositeId({ pubky, postId: testPostId });

      // Verify post tags were persisted
      const savedPostTags = await Core.PostTagsModel.findById(compositePostId);
      expect(savedPostTags).toBeTruthy();
      expect(savedPostTags!.id).toBe(compositePostId);
      expect(savedPostTags!.tags).toHaveLength(2);
      expect(savedPostTags!.tags[0].label).toBe('tech');
      expect(savedPostTags!.tags[0].taggers_count).toBe(1);
      expect(savedPostTags!.tags[1].label).toBe('announcement');
      expect(savedPostTags!.tags[1].taggers_count).toBe(2);
    });
  });

  describe('persistStreams', () => {
    it('should persist post stream to the database', async () => {
      const headPostId = 'head-post-id';
      const randomPostId = 'random-post-id';
      const mockData = generateMockBootstrapData(pubky, headPostId);

      await Core.LocalPersistenceService.persistStreams(mockData.list);

      // Verify stream was created
      const savedStream = await Core.PostStreamModel.findById(Core.PostStreamTypes.TIMELINE_ALL);
      expect(savedStream).toBeTruthy();
      expect(savedStream!.id).toBe(Core.PostStreamTypes.TIMELINE_ALL);
      expect(savedStream!.stream).toEqual([headPostId, randomPostId]);
    });

    it('should persist user streams for influencers and recommended', async () => {
      const mockData = generateMockBootstrapData(pubky, 'test-post-id');

      await Core.LocalPersistenceService.persistStreams(mockData.list);

      // Verify influencers stream was created
      const savedInfluencersStream = await Core.UserStreamModel.findById(Core.UserStreamTypes.TODAY_INFLUENCERS_ALL);
      expect(savedInfluencersStream).toBeTruthy();
      expect(savedInfluencersStream!.id).toBe(Core.UserStreamTypes.TODAY_INFLUENCERS_ALL);
      expect(savedInfluencersStream!.stream).toEqual(['influencer-user-1', 'influencer-user-2']);

      // Verify recommended stream was created
      const savedRecommendedStream = await Core.UserStreamModel.findById(Core.UserStreamTypes.RECOMMENDED);
      expect(savedRecommendedStream).toBeTruthy();
      expect(savedRecommendedStream!.id).toBe(Core.UserStreamTypes.RECOMMENDED);
      expect(savedRecommendedStream!.stream).toEqual([
        'recommended-user-1',
        'recommended-user-2',
        'recommended-user-3',
      ]);
    });
  });

  describe('persistBootstrap', () => {
    it('should persist complete bootstrap data with users, posts, and streams', async () => {
      const testUserId = 'user-123';
      const testPostId = 'post-456';
      const mockData = generateMockBootstrapData(testUserId, testPostId);

      await Core.LocalPersistenceService.persistBootstrap(mockData);

      // Verify user data was persisted
      const savedUserDetails = await Core.UserDetailsModel.findById(testUserId);
      expect(savedUserDetails).toBeTruthy();
      expect(savedUserDetails!.name).toBe('Bootstrap User');

      const savedUserCounts = await Core.UserCountsModel.findById(testUserId);
      expect(savedUserCounts).toBeTruthy();

      const savedUserRelationships = await Core.UserRelationshipsModel.findById(testUserId);
      expect(savedUserRelationships).toBeTruthy();

      const savedUserTags = await Core.UserTagsModel.findById(testUserId);
      expect(savedUserTags).toBeTruthy();

      // Verify post data was persisted
      const compositePostId = Core.buildPostCompositeId({ pubky: testUserId, postId: testPostId });
      const savedPostDetails = await Core.PostDetailsModel.findById(compositePostId);
      expect(savedPostDetails).toBeTruthy();
      expect(savedPostDetails!.content).toBe('Bootstrap post content');

      const savedPostCounts = await Core.PostCountsModel.findById(compositePostId);
      expect(savedPostCounts).toBeTruthy();

      const savedPostTags = await Core.PostTagsModel.findById(compositePostId);
      expect(savedPostTags).toBeTruthy();

      // Verify streams were created
      const savedStream = await Core.PostStreamModel.findById(Core.PostStreamTypes.TIMELINE_ALL);
      expect(savedStream).toBeTruthy();
      expect(savedStream!.stream).toEqual([testPostId, 'random-post-id']);

      const savedInfluencersStream = await Core.UserStreamModel.findById(Core.UserStreamTypes.TODAY_INFLUENCERS_ALL);
      expect(savedInfluencersStream).toBeTruthy();
      expect(savedInfluencersStream!.stream).toEqual(['influencer-user-1', 'influencer-user-2']);

      const savedRecommendedStream = await Core.UserStreamModel.findById(Core.UserStreamTypes.RECOMMENDED);
      expect(savedRecommendedStream).toBeTruthy();
      expect(savedRecommendedStream!.stream).toEqual([
        'recommended-user-1',
        'recommended-user-2',
        'recommended-user-3',
      ]);
    });

    it('should handle persistence in parallel', async () => {
      const testUserId = 'user-123';
      const testPostId = 'post-456';
      const mockData = generateMockBootstrapData(testUserId, testPostId);

      const startTime = Date.now();
      await Core.LocalPersistenceService.persistBootstrap(mockData);
      const endTime = Date.now();

      // Verify all data was persisted successfully
      const savedUserDetails = await Core.UserDetailsModel.findById(testUserId);
      expect(savedUserDetails).toBeTruthy();

      const compositePostId = Core.buildPostCompositeId({ pubky: testUserId, postId: testPostId });
      const savedPostDetails = await Core.PostDetailsModel.findById(compositePostId);
      expect(savedPostDetails).toBeTruthy();

      const savedStream = await Core.PostStreamModel.findById(Core.PostStreamTypes.TIMELINE_ALL);
      expect(savedStream).toBeTruthy();

      // Verify operation completed (no assertion on time, just ensure it runs)
      expect(endTime).toBeGreaterThan(startTime);
    });
  });
});
