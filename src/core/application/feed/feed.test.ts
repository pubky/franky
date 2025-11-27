import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PubkyAppFeedReach, PubkyAppFeedSort, FeedResult, PubkyAppFeedLayout } from 'pubky-app-specs';
import { FeedApplication } from './feed';
import * as Core from '@/core';
import type { AuthStore } from '@/core/stores/auth/auth.types';

// Mock the LocalFeedService
vi.mock('@/core/services/local/feed', () => ({
  LocalFeedService: {
    persist: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
  },
}));

// Mock the HomeserverService
vi.mock('@/core/services/homeserver', () => ({
  HomeserverService: {
    request: vi.fn(),
  },
}));

// Mock feedUriBuilder and FeedNormalizer
vi.mock('pubky-app-specs', async () => {
  const actual = await vi.importActual('pubky-app-specs');
  return {
    ...actual,
    feedUriBuilder: vi.fn((userId: string, feedId: string) => `pubky://${userId}/pub/pubky.app/feeds/${feedId}`),
  };
});

describe('FeedApplication', () => {
  const testUserId = 'o1gg96ewuojmopcjbz8895478wdtxtzzuxnfjjz8o8e77csa1ngo' as Core.Pubky;

  // Test data factory
  const createMockFeedResult = (): FeedResult =>
    ({
      feed: {
        name: 'Bitcoin News',
        feed: {
          tags: ['bitcoin', 'lightning'],
          reach: PubkyAppFeedReach.All,
          sort: PubkyAppFeedSort.Recent,
          layout: PubkyAppFeedLayout.Columns,
          content: null,
        },
        toJson: () => ({
          name: 'Bitcoin News',
          feed: { tags: ['bitcoin', 'lightning'], reach: 'all', sort: 'recent', layout: 'columns', content: null },
        }),
      },
      meta: {
        id: 'feed123',
        url: `pubky://${testUserId}/pub/pubky.app/feeds/feed123`,
        path: '/pub/pubky.app/feeds/feed123',
      },
    }) as unknown as FeedResult;

  const createMockCreateParams = (): Core.TFeedPersistCreateParams => ({
    params: {
      name: 'Bitcoin News',
      tags: ['bitcoin', 'lightning'],
      reach: PubkyAppFeedReach.All,
      sort: PubkyAppFeedSort.Recent,
      content: null,
      layout: PubkyAppFeedLayout.Columns,
    },
    layout: PubkyAppFeedLayout.Columns,
  });

  const createMockDeleteParams = (): Core.TFeedPersistDeleteParams => ({
    feedId: 'feed123',
  });

  // Helper functions
  const setupMocks = () => {
    // Mock FeedNormalizer
    vi.spyOn(Core.FeedNormalizer, 'to').mockReturnValue(createMockFeedResult());

    return {
      persistSpy: vi.spyOn(Core.LocalFeedService, 'persist'),
      deleteSpy: vi.spyOn(Core.LocalFeedService, 'delete'),
      findByIdSpy: vi.spyOn(Core.LocalFeedService, 'findById'),
      requestSpy: vi.spyOn(Core.HomeserverService, 'request'),
      authSpy: vi.spyOn(Core.useAuthStore, 'getState'),
      normalizerSpy: vi.spyOn(Core.FeedNormalizer, 'to'),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('persist with PUT action (create)', () => {
    it('should normalize, save locally and sync to homeserver successfully', async () => {
      const mockParams = createMockCreateParams();
      const { persistSpy, requestSpy, authSpy, normalizerSpy } = setupMocks();

      authSpy.mockReturnValue({ selectCurrentUserPubky: () => testUserId } as Partial<AuthStore>);
      persistSpy.mockResolvedValue(undefined);
      requestSpy.mockResolvedValue(undefined);

      const result = await FeedApplication.persist(Core.HomeserverAction.PUT, mockParams);

      expect(normalizerSpy).toHaveBeenCalledWith(mockParams.params, testUserId);
      expect(persistSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'feed123',
          name: 'Bitcoin News',
          tags: ['bitcoin', 'lightning'],
        }),
      );
      expect(requestSpy).toHaveBeenCalledWith(
        Core.HomeserverAction.PUT,
        expect.stringContaining('pubky://'),
        expect.any(Object),
      );
      expect(result).toBeTruthy();
      expect(result!.id).toBe('feed123');
    });

    it('should preserve existing ID when updating', async () => {
      const mockParams: Core.TFeedPersistCreateParams = {
        ...createMockCreateParams(),
        existingId: 'existing-feed-id',
      };
      const { persistSpy, findByIdSpy, requestSpy, authSpy } = setupMocks();

      authSpy.mockReturnValue({ selectCurrentUserPubky: () => testUserId } as Partial<AuthStore>);
      findByIdSpy.mockResolvedValue({
        id: 'existing-feed-id',
        created_at: 1000000,
      } as Core.FeedModelSchema);
      persistSpy.mockResolvedValue(undefined);
      requestSpy.mockResolvedValue(undefined);

      const result = await FeedApplication.persist(Core.HomeserverAction.PUT, mockParams);

      expect(result!.id).toBe('existing-feed-id');
      expect(result!.created_at).toBe(1000000);
    });

    it('should throw error when user is not authenticated', async () => {
      const mockParams = createMockCreateParams();
      const { authSpy } = setupMocks();

      authSpy.mockReturnValue({ selectCurrentUserPubky: () => null } as unknown as Partial<AuthStore>);

      await expect(FeedApplication.persist(Core.HomeserverAction.PUT, mockParams)).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('should throw when local save fails', async () => {
      const mockParams = createMockCreateParams();
      const { persistSpy, authSpy } = setupMocks();

      authSpy.mockReturnValue({ selectCurrentUserPubky: () => testUserId } as Partial<AuthStore>);
      persistSpy.mockRejectedValue(new Error('Database error'));

      await expect(FeedApplication.persist(Core.HomeserverAction.PUT, mockParams)).rejects.toThrow('Database error');
    });

    it('should throw when homeserver sync fails', async () => {
      const mockParams = createMockCreateParams();
      const { persistSpy, requestSpy, authSpy } = setupMocks();

      authSpy.mockReturnValue({ selectCurrentUserPubky: () => testUserId } as Partial<AuthStore>);
      persistSpy.mockResolvedValue(undefined);
      requestSpy.mockRejectedValue(new Error('Failed to PUT to homeserver: 500'));

      await expect(FeedApplication.persist(Core.HomeserverAction.PUT, mockParams)).rejects.toThrow(
        'Failed to PUT to homeserver: 500',
      );
    });
  });

  describe('persist with DELETE action', () => {
    it('should delete locally and sync to homeserver successfully', async () => {
      const mockParams = createMockDeleteParams();
      const { deleteSpy, requestSpy, authSpy } = setupMocks();

      authSpy.mockReturnValue({ selectCurrentUserPubky: () => testUserId } as Partial<AuthStore>);
      deleteSpy.mockResolvedValue(undefined);
      requestSpy.mockResolvedValue(undefined);

      const result = await FeedApplication.persist(Core.HomeserverAction.DELETE, mockParams);

      expect(deleteSpy).toHaveBeenCalledWith('feed123');
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.DELETE, expect.stringContaining('pubky://'));
      expect(result).toBeUndefined();
    });

    it('should throw error when user is not authenticated', async () => {
      const mockParams = createMockDeleteParams();
      const { authSpy } = setupMocks();

      authSpy.mockReturnValue({ selectCurrentUserPubky: () => null } as unknown as Partial<AuthStore>);

      await expect(FeedApplication.persist(Core.HomeserverAction.DELETE, mockParams)).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('should throw when local delete fails', async () => {
      const mockParams = createMockDeleteParams();
      const { deleteSpy, authSpy } = setupMocks();

      authSpy.mockReturnValue({ selectCurrentUserPubky: () => testUserId } as Partial<AuthStore>);
      deleteSpy.mockRejectedValue(new Error('Feed not found'));

      await expect(FeedApplication.persist(Core.HomeserverAction.DELETE, mockParams)).rejects.toThrow('Feed not found');
    });

    it('should throw when homeserver sync fails', async () => {
      const mockParams = createMockDeleteParams();
      const { deleteSpy, requestSpy, authSpy } = setupMocks();

      authSpy.mockReturnValue({ selectCurrentUserPubky: () => testUserId } as Partial<AuthStore>);
      deleteSpy.mockResolvedValue(undefined);
      requestSpy.mockRejectedValue(new Error('Failed to DELETE from homeserver: 404'));

      await expect(FeedApplication.persist(Core.HomeserverAction.DELETE, mockParams)).rejects.toThrow(
        'Failed to DELETE from homeserver: 404',
      );
    });
  });
});
