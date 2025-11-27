import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PubkyAppFeedLayout, PubkyAppFeedReach, PubkyAppFeedSort, PubkyAppPostKind } from 'pubky-app-specs';
import * as Core from '@/core';
import type { TFeedCreateParams, TFeedUpdateParams, TFeedDeleteParams } from './feed.types';
import type { AuthStore } from '@/core/stores/auth/auth.types';

const testData = {
  userPubky: 'o1gg96ewuojmopcjbz8895478wdtxtzzuxnfjjz8o8e77csa1ngo' as Core.Pubky,
};

const createFeedParams = (overrides: Partial<TFeedCreateParams> = {}): TFeedCreateParams => ({
  name: 'Bitcoin News',
  tags: ['bitcoin', 'lightning'],
  reach: PubkyAppFeedReach.All,
  sort: PubkyAppFeedSort.Recent,
  content: null,
  layout: PubkyAppFeedLayout.Columns,
  ...overrides,
});

const createMockFeedSchema = (overrides: Partial<Core.FeedModelSchema> = {}): Core.FeedModelSchema => ({
  id: 'feed123',
  name: 'Bitcoin News',
  tags: ['bitcoin', 'lightning'],
  reach: PubkyAppFeedReach.All,
  sort: PubkyAppFeedSort.Recent,
  content: null,
  layout: PubkyAppFeedLayout.Columns,
  created_at: Date.now(),
  updated_at: Date.now(),
  ...overrides,
});

describe('FeedController', () => {
  let FeedController: typeof import('./feed').FeedController;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock auth store (needed for application layer)
    vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue({
      selectCurrentUserPubky: () => testData.userPubky,
    } as Partial<AuthStore>);

    // Mock FeedApplication
    vi.spyOn(Core.FeedApplication, 'persist').mockResolvedValue(createMockFeedSchema());

    // Mock FeedModel
    vi.spyOn(Core.FeedModel, 'findById').mockResolvedValue(createMockFeedSchema());
    vi.spyOn(Core.FeedModel, 'findAllSorted').mockResolvedValue([createMockFeedSchema()]);

    // Import FeedController
    const feedModule = await import('./feed');
    FeedController = feedModule.FeedController;
  });

  describe('create', () => {
    it('should pass params to application layer for persistence', async () => {
      const params = createFeedParams();
      const persistSpy = vi.spyOn(Core.FeedApplication, 'persist');

      const result = await FeedController.create(params);

      expect(persistSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, {
        params,
        layout: params.layout,
      });
      expect(result).toBeTruthy();
      expect(result.id).toBe('feed123');
    });

    it('should throw when user is not authenticated (via application layer)', async () => {
      vi.spyOn(Core.FeedApplication, 'persist').mockRejectedValue(new Error('User not authenticated'));

      await expect(FeedController.create(createFeedParams())).rejects.toThrow('User not authenticated');
    });

    it('should throw when persist returns undefined', async () => {
      vi.spyOn(Core.FeedApplication, 'persist').mockResolvedValue(undefined);

      await expect(FeedController.create(createFeedParams())).rejects.toThrow('Failed to create feed');
    });
  });

  describe('update', () => {
    it('should merge changes with existing feed and persist', async () => {
      const existingFeed = createMockFeedSchema();
      vi.spyOn(Core.FeedModel, 'findById').mockResolvedValue(existingFeed);
      const persistSpy = vi.spyOn(Core.FeedApplication, 'persist');

      const updateParams: TFeedUpdateParams = {
        feedId: 'feed123',
        changes: { tags: ['bitcoin', 'mining'] },
      };

      const result = await FeedController.update(updateParams);

      expect(persistSpy).toHaveBeenCalledWith(
        Core.HomeserverAction.PUT,
        expect.objectContaining({
          params: expect.objectContaining({
            name: existingFeed.name, // Name preserved
            tags: ['bitcoin', 'mining'], // Changed
            reach: existingFeed.reach, // Preserved
          }),
        }),
      );
      expect(result).toBeTruthy();
    });

    it('should throw when feed not found', async () => {
      vi.spyOn(Core.FeedModel, 'findById').mockResolvedValue(null);

      const updateParams: TFeedUpdateParams = {
        feedId: 'nonexistent',
        changes: { tags: ['new'] },
      };

      await expect(FeedController.update(updateParams)).rejects.toThrow('Feed not found');
    });

    it('should throw when user is not authenticated (via application layer)', async () => {
      vi.spyOn(Core.FeedApplication, 'persist').mockRejectedValue(new Error('User not authenticated'));

      await expect(FeedController.update({ feedId: 'feed123', changes: { tags: ['new'] } })).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('should preserve existingId when updating', async () => {
      const persistSpy = vi.spyOn(Core.FeedApplication, 'persist');

      await FeedController.update({
        feedId: 'feed123',
        changes: { sort: PubkyAppFeedSort.Popularity },
      });

      expect(persistSpy).toHaveBeenCalledWith(
        Core.HomeserverAction.PUT,
        expect.objectContaining({
          existingId: 'feed123',
        }),
      );
    });
  });

  describe('delete', () => {
    it('should call persist with DELETE action', async () => {
      const persistSpy = vi.spyOn(Core.FeedApplication, 'persist');
      const deleteParams: TFeedDeleteParams = { feedId: 'feed123' };

      await FeedController.delete(deleteParams);

      expect(persistSpy).toHaveBeenCalledWith(Core.HomeserverAction.DELETE, {
        feedId: 'feed123',
      });
    });

    it('should throw when user is not authenticated (via application layer)', async () => {
      vi.spyOn(Core.FeedApplication, 'persist').mockRejectedValue(new Error('User not authenticated'));

      await expect(FeedController.delete({ feedId: 'feed123' })).rejects.toThrow('User not authenticated');
    });
  });

  describe('list', () => {
    it('should return all feeds sorted', async () => {
      const feeds = [
        createMockFeedSchema({ id: 'feed1', name: 'Feed 1' }),
        createMockFeedSchema({ id: 'feed2', name: 'Feed 2' }),
      ];
      vi.spyOn(Core.FeedModel, 'findAllSorted').mockResolvedValue(feeds);

      const result = await FeedController.list();

      expect(result).toHaveLength(2);
      expect(Core.FeedModel.findAllSorted).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return feed by ID', async () => {
      const feed = createMockFeedSchema();
      vi.spyOn(Core.FeedModel.table, 'get').mockResolvedValue(feed);

      const result = await FeedController.get('feed123');

      expect(result).toBeTruthy();
      expect(result!.id).toBe('feed123');
    });

    it('should return undefined when not found', async () => {
      vi.spyOn(Core.FeedModel.table, 'get').mockResolvedValue(undefined);

      const result = await FeedController.get('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('getStreamId', () => {
    it('should generate stream ID for all/recent/all feed', () => {
      const feed = createMockFeedSchema({
        reach: PubkyAppFeedReach.All,
        sort: PubkyAppFeedSort.Recent,
        content: null,
        tags: ['bitcoin', 'lightning'],
      });

      const streamId = FeedController.getStreamId(feed);

      expect(streamId).toBe('timeline:all:all:bitcoin,lightning');
    });

    it('should generate stream ID for following/popularity/image feed', () => {
      const feed = createMockFeedSchema({
        reach: PubkyAppFeedReach.Following,
        sort: PubkyAppFeedSort.Popularity,
        content: PubkyAppPostKind.Image,
        tags: ['photography'],
      });

      const streamId = FeedController.getStreamId(feed);

      expect(streamId).toBe('total_engagement:following:image:photography');
    });

    it('should generate stream ID for friends feed', () => {
      const feed = createMockFeedSchema({
        reach: PubkyAppFeedReach.Friends,
        sort: PubkyAppFeedSort.Recent,
        content: PubkyAppPostKind.Video,
        tags: ['videos', 'tech'],
      });

      const streamId = FeedController.getStreamId(feed);

      expect(streamId).toBe('timeline:friends:video:videos,tech');
    });
  });
});
