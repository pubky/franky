import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LastReadResult } from 'pubky-app-specs';
import { BootstrapApplication } from './bootstrap';
import * as Core from '@/core';
import * as Libs from '@/libs';

// Mock pubky-app-specs to avoid WebAssembly issues
vi.mock('pubky-app-specs', () => ({
  default: vi.fn(() => Promise.resolve()),
}));

const emptyBootstrap = (): Core.NexusBootstrapResponse => ({
  users: [],
  posts: [],
  list: {
    stream: [],
    influencers: [],
    recommended: [],
    hot_tags: [],
  },
});

describe('BootstrapApplication', () => {
  const TEST_PUBKY = '5a1diz4pghi47ywdfyfzpit5f3bdomzt4pugpbmq4rngdd4iub4y';
  const MOCK_LAST_READ_URL = 'http://example.com/last-read';
  const MOCK_LAST_READ = 1234567890;

  const getBootstrapParams = (pubky: string): Core.TBootstrapParams => {
    const {
      meta: { url },
    } = Core.NotificationNormalizer.to(pubky);
    return { pubky, lastReadUrl: url };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Core.NotificationNormalizer, 'to').mockReturnValue({
      meta: {
        url: MOCK_LAST_READ_URL,
      },
    } as LastReadResult);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('read', () => {
    it('should successfully fetch and persist bootstrap data with notifications', async () => {
      const mockBootstrapData: Core.NexusBootstrapResponse = {
        users: [
          {
            details: {
              id: 'user-1',
              name: 'Test User',
              bio: 'Test bio',
              image: null,
              links: null,
              status: null,
              indexed_at: Date.now(),
            },
            counts: {
              followers: 10,
              following: 5,
              posts: 20,
              tagged: 0,
              tags: 0,
              unique_tags: 0,
              replies: 0,
              friends: 0,
              bookmarks: 0,
            },
            relationship: {
              following: false,
              followed_by: false,
              muted: false,
            },
            tags: [],
          },
        ],
        posts: [
          {
            details: {
              id: 'post-1',
              content: 'Test post content',
              kind: 'short',
              attachments: [],
              uri: 'pubky://user-1/pub/pubky.app/posts/post-1',
              indexed_at: Date.now(),
              author: 'user-1',
            },
            counts: {
              replies: 0,
              reposts: 0,
              tags: 0,
              unique_tags: 0,
            },
            relationships: {
              reposted: null,
              replied: null,
              mentioned: [],
            },
            bookmark: null,
            tags: [],
          },
        ],
        list: {
          stream: ['post-1'],
          influencers: ['user-1'],
          recommended: ['user-2'],
          hot_tags: [
            {
              label: 'technology',
              taggers_id: ['user-1'],
              tagged_count: 1,
              taggers_count: 1,
            },
          ],
        },
      };

      const mockNotifications: Core.NexusNotification[] = [
        {
          timestamp: Date.now(),
          body: {
            type: 'like',
            user_id: 'user-2',
            post_id: 'post-1',
          },
        },
      ];

      const mockUnreadCount = 1;
      const expectedNotificationState: Core.NotificationState = {
        unread: mockUnreadCount,
        lastRead: MOCK_LAST_READ,
      };

      const nexusFetchSpy = vi.spyOn(Core.NexusBootstrapService, 'fetch').mockResolvedValue(mockBootstrapData);
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue(undefined);
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue(null);
      const upsertPostsStreamSpy = vi.spyOn(Core.LocalStreamPostsService, 'upsert').mockResolvedValue(undefined);
      const upsertInfluencersStreamSpy = vi.spyOn(Core.LocalStreamUsersService, 'upsert').mockResolvedValue(undefined);
      const upsertTagsStreamSpy = vi.spyOn(Core.LocalStreamTagsService, 'upsert').mockResolvedValue(undefined);
      const homeserverRequestSpy = vi
        .spyOn(Core.HomeserverService, 'request')
        .mockResolvedValue({ timestamp: MOCK_LAST_READ });
      const nexusNotificationsSpy = vi
        .spyOn(Core.NexusUserService, 'notifications')
        .mockResolvedValue(mockNotifications);
      const persistNotificationsSpy = vi
        .spyOn(Core.LocalNotificationService, 'persitAndGetUnreadCount')
        .mockResolvedValue(mockUnreadCount);

      const params = getBootstrapParams(TEST_PUBKY);
      const result = await BootstrapApplication.initialize(params);

      expect(nexusFetchSpy).toHaveBeenCalledWith(TEST_PUBKY);
      expect(homeserverRequestSpy).toHaveBeenCalledWith(Core.HomeserverAction.GET, MOCK_LAST_READ_URL);
      expect(nexusNotificationsSpy).toHaveBeenCalledWith({ user_id: TEST_PUBKY, limit: 30 });
      expect(persistUsersSpy).toHaveBeenCalledWith(mockBootstrapData.users);
      expect(persistPostsSpy).toHaveBeenCalledWith(mockBootstrapData.posts);
      expect(upsertPostsStreamSpy).toHaveBeenCalledWith(
        Core.PostStreamTypes.TIMELINE_ALL,
        mockBootstrapData.list.stream,
      );
      expect(upsertInfluencersStreamSpy).toHaveBeenCalledWith(
        Core.UserStreamTypes.TODAY_INFLUENCERS_ALL,
        mockBootstrapData.list.influencers,
      );
      expect(upsertInfluencersStreamSpy).toHaveBeenCalledWith(
        Core.UserStreamTypes.RECOMMENDED,
        mockBootstrapData.list.recommended,
      );
      expect(upsertTagsStreamSpy).toHaveBeenCalledWith(Core.TagStreamTypes.TODAY_ALL, mockBootstrapData.list.hot_tags);
      expect(persistNotificationsSpy).toHaveBeenCalledWith(mockNotifications, MOCK_LAST_READ);
      expect(result).toEqual(expectedNotificationState);
    });

    it('should throw error when NexusBootstrapService fails', async () => {
      const nexusFetchSpy = vi.spyOn(Core.NexusBootstrapService, 'fetch').mockRejectedValue(new Error('Network error'));
      const homeserverRequestSpy = vi
        .spyOn(Core.HomeserverService, 'request')
        .mockResolvedValue({ timestamp: MOCK_LAST_READ });
      const nexusNotificationsSpy = vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue([]);
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers');
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts');
      const persistNotificationsSpy = vi.spyOn(Core.LocalNotificationService, 'persitAndGetUnreadCount');

      const params = getBootstrapParams(TEST_PUBKY);
      await expect(BootstrapApplication.initialize(params)).rejects.toThrow('Network error');

      expect(nexusFetchSpy).toHaveBeenCalledWith(TEST_PUBKY);
      expect(homeserverRequestSpy).toHaveBeenCalledWith(Core.HomeserverAction.GET, MOCK_LAST_READ_URL);
      expect(nexusNotificationsSpy).toHaveBeenCalledWith({ user_id: TEST_PUBKY, limit: 30 });
      expect(persistUsersSpy).not.toHaveBeenCalled();
      expect(persistPostsSpy).not.toHaveBeenCalled();
      expect(persistNotificationsSpy).not.toHaveBeenCalled();
    });

    it('should throw error when LocalPersistenceService fails', async () => {
      const mockBootstrapData: Core.NexusBootstrapResponse = emptyBootstrap();

      const mockNotifications: Core.NexusNotification[] = [];

      const nexusFetchSpy = vi.spyOn(Core.NexusBootstrapService, 'fetch').mockResolvedValue(mockBootstrapData);
      const homeserverRequestSpy = vi
        .spyOn(Core.HomeserverService, 'request')
        .mockResolvedValue({ timestamp: MOCK_LAST_READ });
      const nexusNotificationsSpy = vi
        .spyOn(Core.NexusUserService, 'notifications')
        .mockResolvedValue(mockNotifications);
      const persistUsersSpy = vi
        .spyOn(Core.LocalStreamUsersService, 'persistUsers')
        .mockRejectedValue(new Error('Database error'));

      const params = getBootstrapParams(TEST_PUBKY);
      await expect(BootstrapApplication.initialize(params)).rejects.toThrow('Database error');

      expect(nexusFetchSpy).toHaveBeenCalledWith(TEST_PUBKY);
      expect(homeserverRequestSpy).toHaveBeenCalledWith(Core.HomeserverAction.GET, MOCK_LAST_READ_URL);
      expect(nexusNotificationsSpy).toHaveBeenCalledWith({ user_id: TEST_PUBKY, limit: 30 });
      expect(persistUsersSpy).toHaveBeenCalledWith(mockBootstrapData.users);
    });

    it('should handle empty bootstrap data', async () => {
      const mockBootstrapData: Core.NexusBootstrapResponse = emptyBootstrap();

      const mockNotifications: Core.NexusNotification[] = [];
      const mockUnreadCount = 0;
      const expectedNotificationState: Core.NotificationState = {
        unread: mockUnreadCount,
        lastRead: MOCK_LAST_READ,
      };

      const nexusFetchSpy = vi.spyOn(Core.NexusBootstrapService, 'fetch').mockResolvedValue(mockBootstrapData);
      const homeserverRequestSpy = vi
        .spyOn(Core.HomeserverService, 'request')
        .mockResolvedValue({ timestamp: MOCK_LAST_READ });
      const nexusNotificationsSpy = vi
        .spyOn(Core.NexusUserService, 'notifications')
        .mockResolvedValue(mockNotifications);
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue(undefined);
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue(null);
      vi.spyOn(Core.LocalStreamPostsService, 'upsert').mockResolvedValue(undefined);
      vi.spyOn(Core.LocalStreamUsersService, 'upsert').mockResolvedValue(undefined);
      vi.spyOn(Core.LocalStreamTagsService, 'upsert').mockResolvedValue(undefined);
      const persistNotificationsSpy = vi
        .spyOn(Core.LocalNotificationService, 'persitAndGetUnreadCount')
        .mockResolvedValue(mockUnreadCount);

      const params = getBootstrapParams(TEST_PUBKY);
      const result = await BootstrapApplication.initialize(params);

      expect(nexusFetchSpy).toHaveBeenCalledWith(TEST_PUBKY);
      expect(homeserverRequestSpy).toHaveBeenCalledWith(Core.HomeserverAction.GET, MOCK_LAST_READ_URL);
      expect(nexusNotificationsSpy).toHaveBeenCalledWith({ user_id: TEST_PUBKY, limit: 30 });
      expect(persistUsersSpy).toHaveBeenCalledWith(mockBootstrapData.users);
      expect(persistPostsSpy).toHaveBeenCalledWith(mockBootstrapData.posts);
      expect(persistNotificationsSpy).toHaveBeenCalledWith(mockNotifications, MOCK_LAST_READ);
      expect(result).toEqual(expectedNotificationState);
    });
  });

  describe('authorizeAndBootstrap', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should successfully bootstrap on first attempt', async () => {
      const mockBootstrapData: Core.NexusBootstrapResponse = emptyBootstrap();

      const mockNotifications: Core.NexusNotification[] = [];
      const mockUnreadCount = 0;
      const expectedNotificationState: Core.NotificationState = {
        unread: mockUnreadCount,
        lastRead: MOCK_LAST_READ,
      };

      const nexusFetchSpy = vi.spyOn(Core.NexusBootstrapService, 'fetch').mockResolvedValue(mockBootstrapData);
      const homeserverRequestSpy = vi
        .spyOn(Core.HomeserverService, 'request')
        .mockResolvedValue({ timestamp: MOCK_LAST_READ });
      const nexusNotificationsSpy = vi
        .spyOn(Core.NexusUserService, 'notifications')
        .mockResolvedValue(mockNotifications);
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue(undefined);
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue(null);
      vi.spyOn(Core.LocalStreamPostsService, 'upsert').mockResolvedValue(undefined);
      vi.spyOn(Core.LocalStreamUsersService, 'upsert').mockResolvedValue(undefined);
      vi.spyOn(Core.LocalStreamTagsService, 'upsert').mockResolvedValue(undefined);
      const persistNotificationsSpy = vi
        .spyOn(Core.LocalNotificationService, 'persitAndGetUnreadCount')
        .mockResolvedValue(mockUnreadCount);
      const loggerInfoSpy = vi.spyOn(Libs.Logger, 'info').mockImplementation(() => {});
      const loggerErrorSpy = vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

      const params = getBootstrapParams(TEST_PUBKY);
      const bootstrapPromise = BootstrapApplication.initializeWithRetry(params);

      // Fast-forward time for the first 5 second delay
      await vi.advanceTimersByTimeAsync(5000);

      const result = await bootstrapPromise;

      expect(loggerInfoSpy).toHaveBeenCalledWith('Waiting 5 seconds before bootstrap attempt 1...');
      expect(nexusFetchSpy).toHaveBeenCalledWith(TEST_PUBKY);
      expect(homeserverRequestSpy).toHaveBeenCalledWith(Core.HomeserverAction.GET, MOCK_LAST_READ_URL);
      expect(nexusNotificationsSpy).toHaveBeenCalledWith({ user_id: TEST_PUBKY, limit: 30 });
      expect(persistUsersSpy).toHaveBeenCalledWith(mockBootstrapData.users);
      expect(persistPostsSpy).toHaveBeenCalledWith(mockBootstrapData.posts);
      expect(persistNotificationsSpy).toHaveBeenCalledWith(mockNotifications, MOCK_LAST_READ);
      expect(result).toEqual(expectedNotificationState);
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should retry up to 3 times and succeed on second attempt', async () => {
      const mockBootstrapData: Core.NexusBootstrapResponse = emptyBootstrap();

      const mockNotifications: Core.NexusNotification[] = [];
      const mockUnreadCount = 0;
      const expectedNotificationState: Core.NotificationState = {
        unread: mockUnreadCount,
        lastRead: MOCK_LAST_READ,
      };

      const nexusFetchSpy = vi
        .spyOn(Core.NexusBootstrapService, 'fetch')
        .mockRejectedValueOnce(new Error('Not indexed yet'))
        .mockResolvedValueOnce(mockBootstrapData);
      const homeserverRequestSpy = vi
        .spyOn(Core.HomeserverService, 'request')
        .mockResolvedValue({ timestamp: MOCK_LAST_READ });
      const nexusNotificationsSpy = vi
        .spyOn(Core.NexusUserService, 'notifications')
        .mockResolvedValue(mockNotifications);
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue(undefined);
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue(null);
      vi.spyOn(Core.LocalStreamPostsService, 'upsert').mockResolvedValue(undefined);
      vi.spyOn(Core.LocalStreamUsersService, 'upsert').mockResolvedValue(undefined);
      vi.spyOn(Core.LocalStreamTagsService, 'upsert').mockResolvedValue(undefined);
      const persistNotificationsSpy = vi
        .spyOn(Core.LocalNotificationService, 'persitAndGetUnreadCount')
        .mockResolvedValue(mockUnreadCount);
      const loggerInfoSpy = vi.spyOn(Libs.Logger, 'info').mockImplementation(() => {});
      const loggerErrorSpy = vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

      const params = getBootstrapParams(TEST_PUBKY);
      const bootstrapPromise = BootstrapApplication.initializeWithRetry(params);

      // First attempt - wait 5 seconds then fail
      await vi.advanceTimersByTimeAsync(5000);
      await vi.runAllTimersAsync();

      // Second attempt - wait another 5 seconds then succeed
      await vi.advanceTimersByTimeAsync(5000);

      const result = await bootstrapPromise;

      expect(loggerInfoSpy).toHaveBeenCalledWith('Waiting 5 seconds before bootstrap attempt 1...');
      expect(loggerInfoSpy).toHaveBeenCalledWith('Waiting 5 seconds before bootstrap attempt 2...');
      expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to bootstrap', expect.any(Error), 0);
      expect(nexusFetchSpy).toHaveBeenCalledTimes(2);
      expect(homeserverRequestSpy).toHaveBeenCalledTimes(2);
      expect(nexusNotificationsSpy).toHaveBeenCalledTimes(2);
      expect(persistUsersSpy).toHaveBeenCalledWith(mockBootstrapData.users);
      expect(persistPostsSpy).toHaveBeenCalledWith(mockBootstrapData.posts);
      expect(persistNotificationsSpy).toHaveBeenCalledWith(mockNotifications, MOCK_LAST_READ);
      expect(result).toEqual(expectedNotificationState);
    });

    it('should retry up to 3 times and throw error if all attempts fail', async () => {
      const nexusFetchSpy = vi
        .spyOn(Core.NexusBootstrapService, 'fetch')
        .mockRejectedValue(new Error('User not indexed'));
      const homeserverRequestSpy = vi
        .spyOn(Core.HomeserverService, 'request')
        .mockResolvedValue({ timestamp: MOCK_LAST_READ });
      const nexusNotificationsSpy = vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue([]);
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers');
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts');
      const persistNotificationsSpy = vi.spyOn(Core.LocalNotificationService, 'persitAndGetUnreadCount');
      const loggerInfoSpy = vi.spyOn(Libs.Logger, 'info').mockImplementation(() => {});
      const loggerErrorSpy = vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

      const params = getBootstrapParams(TEST_PUBKY);
      const p = BootstrapApplication.initializeWithRetry(params);
      const assertion = expect(p).rejects.toThrow('User still not indexed');

      // Advance timers for all 3 attempts
      await vi.advanceTimersByTimeAsync(15000);

      await assertion;
      expect(loggerInfoSpy).toHaveBeenCalledTimes(3);
      expect(loggerErrorSpy).toHaveBeenCalledTimes(3);
      expect(nexusFetchSpy).toHaveBeenCalledTimes(3);
      expect(homeserverRequestSpy).toHaveBeenCalledTimes(3);
      expect(nexusNotificationsSpy).toHaveBeenCalledTimes(3);
      expect(persistUsersSpy).not.toHaveBeenCalled();
      expect(persistPostsSpy).not.toHaveBeenCalled();
      expect(persistNotificationsSpy).not.toHaveBeenCalled();
    });

    it('should log retry count on each failure', async () => {
      vi.spyOn(Core.NexusBootstrapService, 'fetch').mockRejectedValue(new Error('User not indexed'));
      vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue({ timestamp: 1234567890 });
      vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue([]);
      const loggerErrorSpy = vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

      const params = getBootstrapParams(TEST_PUBKY);
      const p = BootstrapApplication.initializeWithRetry(params);
      const assertion = expect(p).rejects.toThrow('User still not indexed');

      // Advance timers for all 3 attempts
      await vi.advanceTimersByTimeAsync(15000);

      await assertion;
      expect(loggerErrorSpy).toHaveBeenNthCalledWith(1, 'Failed to bootstrap', expect.any(Error), 0);
      expect(loggerErrorSpy).toHaveBeenNthCalledWith(2, 'Failed to bootstrap', expect.any(Error), 1);
      expect(loggerErrorSpy).toHaveBeenNthCalledWith(3, 'Failed to bootstrap', expect.any(Error), 2);
    });

    it('should wait 5 seconds between each retry attempt', async () => {
      const mockBootstrapData: Core.NexusBootstrapResponse = emptyBootstrap();

      const mockNotifications: Core.NexusNotification[] = [];
      const mockUnreadCount = 0;
      const expectedNotificationState: Core.NotificationState = {
        unread: mockUnreadCount,
        lastRead: MOCK_LAST_READ,
      };

      const nexusFetchSpy = vi
        .spyOn(Core.NexusBootstrapService, 'fetch')
        .mockRejectedValueOnce(new Error('Not indexed yet'))
        .mockRejectedValueOnce(new Error('Still not indexed'))
        .mockResolvedValueOnce(mockBootstrapData);
      const homeserverRequestSpy = vi
        .spyOn(Core.HomeserverService, 'request')
        .mockResolvedValue({ timestamp: MOCK_LAST_READ });
      const nexusNotificationsSpy = vi
        .spyOn(Core.NexusUserService, 'notifications')
        .mockResolvedValue(mockNotifications);
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue(undefined);
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue(null);
      vi.spyOn(Core.LocalStreamPostsService, 'upsert').mockResolvedValue(undefined);
      vi.spyOn(Core.LocalStreamUsersService, 'upsert').mockResolvedValue(undefined);
      vi.spyOn(Core.LocalStreamTagsService, 'upsert').mockResolvedValue(undefined);
      const persistNotificationsSpy = vi
        .spyOn(Core.LocalNotificationService, 'persitAndGetUnreadCount')
        .mockResolvedValue(mockUnreadCount);
      const loggerInfoSpy = vi.spyOn(Libs.Logger, 'info').mockImplementation(() => {});

      const params = getBootstrapParams(TEST_PUBKY);
      const bootstrapPromise = BootstrapApplication.initializeWithRetry(params);

      // First attempt
      expect(nexusFetchSpy).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(5000);
      await vi.runAllTimersAsync();

      // Second attempt
      await vi.advanceTimersByTimeAsync(5000);
      await vi.runAllTimersAsync();

      // Third attempt
      await vi.advanceTimersByTimeAsync(5000);

      const result = await bootstrapPromise;

      expect(loggerInfoSpy).toHaveBeenCalledTimes(3);
      expect(loggerInfoSpy).toHaveBeenNthCalledWith(1, 'Waiting 5 seconds before bootstrap attempt 1...');
      expect(loggerInfoSpy).toHaveBeenNthCalledWith(2, 'Waiting 5 seconds before bootstrap attempt 2...');
      expect(loggerInfoSpy).toHaveBeenNthCalledWith(3, 'Waiting 5 seconds before bootstrap attempt 3...');
      expect(nexusFetchSpy).toHaveBeenCalledTimes(3);
      expect(homeserverRequestSpy).toHaveBeenCalledTimes(3);
      expect(nexusNotificationsSpy).toHaveBeenCalledTimes(3);
      expect(persistUsersSpy).toHaveBeenCalledWith(mockBootstrapData.users);
      expect(persistPostsSpy).toHaveBeenCalledWith(mockBootstrapData.posts);
      expect(persistNotificationsSpy).toHaveBeenCalledWith(mockNotifications, MOCK_LAST_READ);
      expect(result).toEqual(expectedNotificationState);
    });
  });
});
