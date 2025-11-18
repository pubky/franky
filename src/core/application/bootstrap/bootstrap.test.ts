import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LastReadResult } from 'pubky-app-specs';
import { BootstrapApplication } from './bootstrap';
import * as Core from '@/core';
import * as Libs from '@/libs';

// Mock pubky-app-specs to avoid WebAssembly issues
vi.mock('pubky-app-specs', () => ({
  default: vi.fn(() => Promise.resolve()),
}));

const TEST_PUBKY = '5a1diz4pghi47ywdfyfzpit5f3bdomzt4pugpbmq4rngdd4iub4y';
const MOCK_LAST_READ_URL = 'http://example.com/last-read';
const MOCK_LAST_READ = 1234567890;

const emptyBootstrap = (): Core.NexusBootstrapResponse => ({
  users: [],
  posts: [],
  list: { stream: [], influencers: [], recommended: [], hot_tags: [] },
});

const createMockBootstrapData = (): Core.NexusBootstrapResponse => ({
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
      relationship: { following: false, followed_by: false, muted: false },
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
      counts: { replies: 0, reposts: 0, tags: 0, unique_tags: 0 },
      relationships: { reposted: null, replied: null, mentioned: [] },
      bookmark: null,
      tags: [],
    },
  ],
  list: {
    stream: ['post-1'],
    influencers: ['user-1'],
    recommended: ['user-2'],
    hot_tags: [{ label: 'technology', taggers_id: ['user-1'], tagged_count: 1, taggers_count: 1 }],
  },
});

const createMockNotification = (): Core.NexusNotification => ({
  timestamp: Date.now(),
  body: { type: 'like', user_id: 'user-2', post_id: 'post-1' },
});

const getBootstrapParams = (pubky: string): Core.TBootstrapParams => {
  const {
    meta: { url },
  } = Core.NotificationNormalizer.to(pubky);
  return { pubky, lastReadUrl: url };
};

type MockConfig = {
  bootstrapData?: Core.NexusBootstrapResponse | null;
  bootstrapError?: Error;
  notifications?: Core.NexusNotification[];
  notificationsError?: Error;
  homeserverError?: Error;
  unreadCount?: number;
  persistUsersError?: Error;
  persistPostsError?: Error;
  upsertPostsError?: Error;
  persistNotificationsError?: Error;
};

type ServiceMocks = {
  nexusFetch: unknown;
  homeserverRequest: unknown;
  nexusNotifications: unknown;
  persistUsers: unknown;
  persistPosts: unknown;
  upsertPostsStream: unknown;
  upsertInfluencersStream: unknown;
  upsertHotTags: unknown;
  persistNotifications: unknown;
};

const setupMocks = (config: MockConfig = {}): ServiceMocks => {
  const {
    bootstrapData = emptyBootstrap(),
    bootstrapError,
    notifications = [],
    notificationsError,
    homeserverError,
    unreadCount = 0,
    persistUsersError,
    persistPostsError,
    upsertPostsError,
    persistNotificationsError,
  } = config;

  vi.clearAllMocks();

  return {
    nexusFetch: vi
      .spyOn(Core.NexusBootstrapService, 'fetch')
      .mockImplementation(
        bootstrapError
          ? () => Promise.reject(bootstrapError)
          : () => Promise.resolve(bootstrapData as Core.NexusBootstrapResponse),
      ),
    homeserverRequest: vi
      .spyOn(Core.HomeserverService, 'request')
      .mockImplementation(
        homeserverError ? () => Promise.reject(homeserverError) : () => Promise.resolve({ timestamp: MOCK_LAST_READ }),
      ),
    nexusNotifications: vi
      .spyOn(Core.NexusUserService, 'notifications')
      .mockImplementation(
        notificationsError ? () => Promise.reject(notificationsError) : () => Promise.resolve(notifications),
      ),
    persistUsers: vi
      .spyOn(Core.LocalStreamUsersService, 'persistUsers')
      .mockImplementation(
        persistUsersError ? () => Promise.reject(persistUsersError) : () => Promise.resolve(undefined),
      ),
    persistPosts: vi
      .spyOn(Core.LocalStreamPostsService, 'persistPosts')
      .mockImplementation(persistPostsError ? () => Promise.reject(persistPostsError) : () => Promise.resolve([])),
    upsertPostsStream: vi
      .spyOn(Core.LocalStreamPostsService, 'upsert')
      .mockImplementation(upsertPostsError ? () => Promise.reject(upsertPostsError) : () => Promise.resolve(undefined)),
    upsertInfluencersStream: vi.spyOn(Core.LocalStreamUsersService, 'upsert').mockResolvedValue(undefined),
    upsertHotTags: vi.spyOn(Core.LocalHotService, 'upsert').mockResolvedValue(undefined),
    persistNotifications: vi
      .spyOn(Core.LocalNotificationService, 'persitAndGetUnreadCount')
      .mockImplementation(
        persistNotificationsError
          ? () => Promise.reject(persistNotificationsError)
          : () => Promise.resolve(unreadCount),
      ),
  };
};

const assertCommonCalls = (
  mocks: ServiceMocks,
  bootstrapData: Core.NexusBootstrapResponse,
  notifications: Core.NexusNotification[],
) => {
  expect(mocks.nexusFetch).toHaveBeenCalledWith(TEST_PUBKY);
  expect(mocks.homeserverRequest).toHaveBeenCalledWith(Core.HomeserverAction.GET, MOCK_LAST_READ_URL);
  expect(mocks.nexusNotifications).toHaveBeenCalledWith({ user_id: TEST_PUBKY, limit: 30 });
  expect(mocks.persistUsers).toHaveBeenCalledWith(bootstrapData.users);
  expect(mocks.persistPosts).toHaveBeenCalledWith(bootstrapData.posts);
  expect(mocks.upsertPostsStream).toHaveBeenCalledWith({
    streamId: Core.PostStreamTypes.TIMELINE_ALL_ALL,
    stream: bootstrapData.list.stream,
  });
  expect(mocks.upsertInfluencersStream).toHaveBeenCalledWith(
    Core.UserStreamTypes.TODAY_INFLUENCERS_ALL,
    bootstrapData.list.influencers,
  );
  expect(mocks.upsertInfluencersStream).toHaveBeenCalledWith(
    Core.UserStreamTypes.RECOMMENDED,
    bootstrapData.list.recommended,
  );
  expect(mocks.upsertHotTags).toHaveBeenCalledWith(
    Core.buildHotTagsId(Core.UserStreamTimeframe.TODAY, 'all'),
    bootstrapData.list.hot_tags,
  );
  expect(mocks.persistNotifications).toHaveBeenCalledWith(notifications, MOCK_LAST_READ);
};

describe('BootstrapApplication', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.spyOn(Core.NotificationNormalizer, 'to').mockReturnValue({
      meta: { url: MOCK_LAST_READ_URL },
    } as LastReadResult);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('read', () => {
    it('should successfully fetch and persist bootstrap data with notifications', async () => {
      const bootstrapData = createMockBootstrapData();
      const notifications = [createMockNotification()];
      const mocks = setupMocks({ bootstrapData, notifications, unreadCount: 1 });

      const result = await BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY));

      assertCommonCalls(mocks, bootstrapData, notifications);
      expect(result).toEqual({ unread: 1, lastRead: MOCK_LAST_READ });
    });

    it('should throw error when NexusBootstrapService fails', async () => {
      const mocks = setupMocks({ bootstrapError: new Error('Network error') });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toThrow('Network error');

      expect(mocks.nexusFetch).toHaveBeenCalledWith(TEST_PUBKY);
      expect(mocks.homeserverRequest).toHaveBeenCalledWith(Core.HomeserverAction.GET, MOCK_LAST_READ_URL);
      expect(mocks.nexusNotifications).toHaveBeenCalledWith({ user_id: TEST_PUBKY, limit: 30 });
      expect(mocks.persistUsers).not.toHaveBeenCalled();
      expect(mocks.persistNotifications).not.toHaveBeenCalled();
    });

    it('should throw NO_CONTENT AppError when bootstrap data is empty (null)', async () => {
      const mocks = setupMocks({ bootstrapData: null });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toMatchObject({
        name: 'AppError',
        type: Libs.NexusErrorType.NO_CONTENT,
        statusCode: 204,
        message: 'No content found for bootstrap data',
      });

      expect(mocks.nexusFetch).toHaveBeenCalledWith(TEST_PUBKY);
      expect(mocks.homeserverRequest).toHaveBeenCalledWith(Core.HomeserverAction.GET, MOCK_LAST_READ_URL);
      expect(mocks.nexusNotifications).toHaveBeenCalledWith({ user_id: TEST_PUBKY, limit: 30 });
      expect(mocks.persistUsers).not.toHaveBeenCalled();
      expect(mocks.persistNotifications).not.toHaveBeenCalled();
    });

    it('should throw error when LocalPersistenceService fails', async () => {
      const bootstrapData = emptyBootstrap();
      const mocks = setupMocks({ bootstrapData, persistUsersError: new Error('Database error') });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toThrow('Database error');

      expect(mocks.nexusFetch).toHaveBeenCalledWith(TEST_PUBKY);
      expect(mocks.homeserverRequest).toHaveBeenCalledWith(Core.HomeserverAction.GET, MOCK_LAST_READ_URL);
      expect(mocks.nexusNotifications).toHaveBeenCalledWith({ user_id: TEST_PUBKY, limit: 30 });
      expect(mocks.persistUsers).toHaveBeenCalledWith(bootstrapData.users);
    });

    it('should handle empty bootstrap data', async () => {
      const bootstrapData = emptyBootstrap();
      const mocks = setupMocks({ bootstrapData });

      const result = await BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY));

      assertCommonCalls(mocks, bootstrapData, []);
      expect(result).toEqual({ unread: 0, lastRead: MOCK_LAST_READ });
    });

    it('should throw error when HomeserverService fails', async () => {
      const mocks = setupMocks({ homeserverError: new Error('Homeserver error') });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toThrow('Homeserver error');

      expect(mocks.nexusFetch).toHaveBeenCalledWith(TEST_PUBKY);
      expect(mocks.homeserverRequest).toHaveBeenCalledWith(Core.HomeserverAction.GET, MOCK_LAST_READ_URL);
      expect(mocks.nexusNotifications).not.toHaveBeenCalled();
      expect(mocks.persistUsers).not.toHaveBeenCalled();
    });

    it('should throw error when NexusUserService.notifications fails', async () => {
      const mocks = setupMocks({ notificationsError: new Error('Notifications error') });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toThrow(
        'Notifications error',
      );

      expect(mocks.nexusFetch).toHaveBeenCalledWith(TEST_PUBKY);
      expect(mocks.homeserverRequest).toHaveBeenCalledWith(Core.HomeserverAction.GET, MOCK_LAST_READ_URL);
      expect(mocks.nexusNotifications).toHaveBeenCalledWith({ user_id: TEST_PUBKY, limit: 30 });
      expect(mocks.persistUsers).not.toHaveBeenCalled();
    });

    it('should throw error when persistPosts fails', async () => {
      const bootstrapData = emptyBootstrap();
      const mocks = setupMocks({ bootstrapData, persistPostsError: new Error('Posts persistence error') });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toThrow(
        'Posts persistence error',
      );

      expect(mocks.nexusFetch).toHaveBeenCalledWith(TEST_PUBKY);
      expect(mocks.homeserverRequest).toHaveBeenCalledWith(Core.HomeserverAction.GET, MOCK_LAST_READ_URL);
      expect(mocks.nexusNotifications).toHaveBeenCalledWith({ user_id: TEST_PUBKY, limit: 30 });
      expect(mocks.persistUsers).toHaveBeenCalledWith(bootstrapData.users);
      expect(mocks.persistPosts).toHaveBeenCalledWith(bootstrapData.posts);
    });

    it('should throw error when upsert operations fail', async () => {
      const bootstrapData = emptyBootstrap();
      const mocks = setupMocks({ bootstrapData, upsertPostsError: new Error('Stream upsert error') });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toThrow(
        'Stream upsert error',
      );

      expect(mocks.nexusFetch).toHaveBeenCalledWith(TEST_PUBKY);
      expect(mocks.upsertPostsStream).toHaveBeenCalledWith({
        streamId: Core.PostStreamTypes.TIMELINE_ALL_ALL,
        stream: bootstrapData.list.stream,
      });
    });

    it('should throw error when persistNotifications fails', async () => {
      const bootstrapData = emptyBootstrap();
      const mocks = setupMocks({
        bootstrapData,
        persistNotificationsError: new Error('Notification persistence error'),
      });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toThrow(
        'Notification persistence error',
      );

      expect(mocks.nexusFetch).toHaveBeenCalledWith(TEST_PUBKY);
      expect(mocks.persistUsers).toHaveBeenCalledWith(bootstrapData.users);
      expect(mocks.persistNotifications).toHaveBeenCalledWith([], MOCK_LAST_READ);
    });

    // note: this case should never happen because nexus ensures that users and posts are always returned together
    it('should handle bootstrap data with users but no posts', async () => {
      const bootstrapData: Core.NexusBootstrapResponse = {
        users: createMockBootstrapData().users,
        posts: [],
        list: {
          stream: [],
          influencers: ['user-1'],
          recommended: [],
          hot_tags: [],
        },
      };
      const mocks = setupMocks({ bootstrapData });

      const result = await BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY));

      expect(mocks.persistUsers).toHaveBeenCalledWith(bootstrapData.users);
      expect(mocks.persistPosts).toHaveBeenCalledWith([]);
      expect(mocks.upsertPostsStream).toHaveBeenCalledWith({
        streamId: Core.PostStreamTypes.TIMELINE_ALL_ALL,
        stream: [],
      });
      expect(mocks.upsertInfluencersStream).toHaveBeenCalledWith(Core.UserStreamTypes.TODAY_INFLUENCERS_ALL, [
        'user-1',
      ]);
      expect(result).toEqual({ unread: 0, lastRead: MOCK_LAST_READ });
    });

    // note: this case should never happen because nexus ensures that users and posts are always returned together
    it('should handle bootstrap data with posts but no users', async () => {
      const bootstrapData: Core.NexusBootstrapResponse = {
        users: [],
        posts: createMockBootstrapData().posts,
        list: {
          stream: ['post-1'],
          influencers: [],
          recommended: [],
          hot_tags: [],
        },
      };
      const mocks = setupMocks({ bootstrapData });

      const result = await BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY));

      expect(mocks.persistUsers).toHaveBeenCalledWith([]);
      expect(mocks.persistPosts).toHaveBeenCalledWith(bootstrapData.posts);
      expect(mocks.upsertPostsStream).toHaveBeenCalledWith({
        streamId: Core.PostStreamTypes.TIMELINE_ALL_ALL,
        stream: ['post-1'],
      });
      expect(result).toEqual({ unread: 0, lastRead: MOCK_LAST_READ });
    });

    it('should handle bootstrap data with users and posts but empty lists', async () => {
      const bootstrapData: Core.NexusBootstrapResponse = {
        users: createMockBootstrapData().users,
        posts: createMockBootstrapData().posts,
        list: {
          stream: [],
          influencers: [],
          recommended: [],
          hot_tags: [],
        },
      };
      const mocks = setupMocks({ bootstrapData });

      const result = await BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY));

      expect(mocks.persistUsers).toHaveBeenCalledWith(bootstrapData.users);
      expect(mocks.persistPosts).toHaveBeenCalledWith(bootstrapData.posts);
      expect(mocks.upsertPostsStream).toHaveBeenCalledWith({
        streamId: Core.PostStreamTypes.TIMELINE_ALL_ALL,
        stream: [],
      });
      expect(mocks.upsertInfluencersStream).toHaveBeenCalledWith(Core.UserStreamTypes.TODAY_INFLUENCERS_ALL, []);
      expect(mocks.upsertInfluencersStream).toHaveBeenCalledWith(Core.UserStreamTypes.RECOMMENDED, []);
      expect(mocks.upsertHotTags).toHaveBeenCalledWith(Core.buildHotTagsId(Core.UserStreamTimeframe.TODAY, 'all'), []);
      expect(result).toEqual({ unread: 0, lastRead: MOCK_LAST_READ });
    });

    it('should handle bootstrap data with partial lists (some empty, some populated)', async () => {
      const bootstrapData: Core.NexusBootstrapResponse = {
        users: createMockBootstrapData().users,
        posts: createMockBootstrapData().posts,
        list: {
          stream: ['post-1'],
          influencers: [],
          recommended: ['user-2'],
          hot_tags: [],
        },
      };
      vi.clearAllMocks();
      const mocks = setupMocks({ bootstrapData });

      vi.spyOn(Core.NotificationNormalizer, 'to').mockReturnValue({
        meta: { url: MOCK_LAST_READ_URL },
      } as LastReadResult);

      const result = await BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY));

      expect(mocks.upsertPostsStream).toHaveBeenCalledTimes(1);
      expect(mocks.upsertPostsStream).toHaveBeenCalledWith({
        streamId: Core.PostStreamTypes.TIMELINE_ALL_ALL,
        stream: ['post-1'],
      });
      expect(mocks.upsertInfluencersStream).toHaveBeenCalledWith(Core.UserStreamTypes.TODAY_INFLUENCERS_ALL, []);
      expect(mocks.upsertInfluencersStream).toHaveBeenCalledWith(Core.UserStreamTypes.RECOMMENDED, ['user-2']);
      expect(mocks.upsertHotTags).toHaveBeenCalledWith(Core.buildHotTagsId(Core.UserStreamTimeframe.TODAY, 'all'), []);
      expect(result).toEqual({ unread: 0, lastRead: MOCK_LAST_READ });
    });
  });

  describe('initializeWithRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const setupRetryMocks = (
      config: MockConfig & { fetchBehavior?: 'success' | 'fail' | 'failThenSuccess' | 'failTwiceThenSuccess' },
    ) => {
      const {
        fetchBehavior = 'success',
        bootstrapData = emptyBootstrap(),
        notifications = [],
        unreadCount = 0,
      } = config;
      const nexusFetchSpy = vi.spyOn(Core.NexusBootstrapService, 'fetch');
      const data = bootstrapData || emptyBootstrap();

      if (fetchBehavior === 'fail') {
        nexusFetchSpy.mockRejectedValue(new Error('User not indexed'));
      } else if (fetchBehavior === 'failThenSuccess') {
        nexusFetchSpy.mockRejectedValueOnce(new Error('Not indexed yet')).mockResolvedValueOnce(data);
      } else if (fetchBehavior === 'failTwiceThenSuccess') {
        nexusFetchSpy
          .mockRejectedValueOnce(new Error('Not indexed yet'))
          .mockRejectedValueOnce(new Error('Still not indexed'))
          .mockResolvedValueOnce(data);
      } else {
        nexusFetchSpy.mockResolvedValue(data);
      }

      // Set up all other mocks manually to avoid conflicts
      const homeserverRequestSpy = vi
        .spyOn(Core.HomeserverService, 'request')
        .mockResolvedValue({ timestamp: MOCK_LAST_READ });
      const nexusNotificationsSpy = vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue(notifications);
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue(undefined);
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue([]);
      const upsertPostsStreamSpy = vi.spyOn(Core.LocalStreamPostsService, 'upsert').mockResolvedValue(undefined);
      const upsertInfluencersStreamSpy = vi.spyOn(Core.LocalStreamUsersService, 'upsert').mockResolvedValue(undefined);
      const upsertHotTagsSpy = vi.spyOn(Core.LocalHotService, 'upsert').mockResolvedValue(undefined);
      const persistNotificationsSpy = vi
        .spyOn(Core.LocalNotificationService, 'persitAndGetUnreadCount')
        .mockResolvedValue(unreadCount);
      const loggerInfoSpy = vi.spyOn(Libs.Logger, 'info').mockImplementation(() => {});
      const loggerErrorSpy = vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

      return {
        nexusFetch: nexusFetchSpy,
        homeserverRequest: homeserverRequestSpy,
        nexusNotifications: nexusNotificationsSpy,
        persistUsers: persistUsersSpy,
        persistPosts: persistPostsSpy,
        upsertPostsStream: upsertPostsStreamSpy,
        upsertInfluencersStream: upsertInfluencersStreamSpy,
        upsertHotTags: upsertHotTagsSpy,
        persistNotifications: persistNotificationsSpy,
        loggerInfo: loggerInfoSpy,
        loggerError: loggerErrorSpy,
      };
    };

    it('should successfully bootstrap on first attempt', async () => {
      const mocks = setupRetryMocks({ fetchBehavior: 'success' });
      const bootstrapPromise = BootstrapApplication.initializeWithRetry(getBootstrapParams(TEST_PUBKY));

      await vi.advanceTimersByTimeAsync(5000);
      const result = await bootstrapPromise;

      expect(mocks.loggerInfo).toHaveBeenCalledWith('Waiting 5 seconds before bootstrap attempt 1...');
      expect(mocks.nexusFetch).toHaveBeenCalledWith(TEST_PUBKY);
      expect(mocks.persistUsers).toHaveBeenCalledWith(emptyBootstrap().users);
      expect(result).toEqual({ unread: 0, lastRead: MOCK_LAST_READ });
      expect(mocks.loggerError).not.toHaveBeenCalled();
    });

    it('should retry up to 3 times and succeed on second attempt', async () => {
      const mocks = setupRetryMocks({ fetchBehavior: 'failThenSuccess' });
      const bootstrapPromise = BootstrapApplication.initializeWithRetry(getBootstrapParams(TEST_PUBKY));

      await vi.advanceTimersByTimeAsync(5000);
      await vi.advanceTimersByTimeAsync(5000);
      const result = await bootstrapPromise;

      expect(mocks.loggerInfo).toHaveBeenCalledWith('Waiting 5 seconds before bootstrap attempt 1...');
      expect(mocks.loggerInfo).toHaveBeenCalledWith('Waiting 5 seconds before bootstrap attempt 2...');
      expect(mocks.loggerError).toHaveBeenCalledWith('Failed to bootstrap', expect.any(Error), 0);
      expect(mocks.nexusFetch).toHaveBeenCalledTimes(2);
      expect(mocks.homeserverRequest).toHaveBeenCalledTimes(2);
      expect(mocks.nexusNotifications).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ unread: 0, lastRead: MOCK_LAST_READ });
    });

    it('should retry up to 3 times and throw error if all attempts fail', async () => {
      const mocks = setupRetryMocks({ fetchBehavior: 'fail' });
      const bootstrapPromise = BootstrapApplication.initializeWithRetry(getBootstrapParams(TEST_PUBKY));
      const assertion = expect(bootstrapPromise).rejects.toThrow('User still not indexed');

      await vi.advanceTimersByTimeAsync(15000);
      await assertion;

      expect(mocks.loggerInfo).toHaveBeenCalledTimes(3);
      expect(mocks.loggerError).toHaveBeenCalledTimes(3);
      expect(mocks.nexusFetch).toHaveBeenCalledTimes(3);
      expect(mocks.homeserverRequest).toHaveBeenCalledTimes(3);
      expect(mocks.nexusNotifications).toHaveBeenCalledTimes(3);
      expect(mocks.persistUsers).not.toHaveBeenCalled();
      expect(mocks.persistNotifications).not.toHaveBeenCalled();
    });

    it('should log retry count on each failure', async () => {
      const mocks = setupRetryMocks({ fetchBehavior: 'fail' });
      const bootstrapPromise = BootstrapApplication.initializeWithRetry(getBootstrapParams(TEST_PUBKY));
      const assertion = expect(bootstrapPromise).rejects.toThrow('User still not indexed');

      await vi.advanceTimersByTimeAsync(15000);
      await assertion;

      expect(mocks.loggerError).toHaveBeenNthCalledWith(1, 'Failed to bootstrap', expect.any(Error), 0);
      expect(mocks.loggerError).toHaveBeenNthCalledWith(2, 'Failed to bootstrap', expect.any(Error), 1);
      expect(mocks.loggerError).toHaveBeenNthCalledWith(3, 'Failed to bootstrap', expect.any(Error), 2);
    });

    it('should wait 5 seconds between each retry attempt', async () => {
      const mocks = setupRetryMocks({ fetchBehavior: 'failTwiceThenSuccess' });
      const bootstrapPromise = BootstrapApplication.initializeWithRetry(getBootstrapParams(TEST_PUBKY));

      expect(mocks.nexusFetch).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(5000);
      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(5000);
      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(5000);

      const result = await bootstrapPromise;

      expect(mocks.loggerInfo).toHaveBeenCalledTimes(3);
      expect(mocks.loggerInfo).toHaveBeenNthCalledWith(1, 'Waiting 5 seconds before bootstrap attempt 1...');
      expect(mocks.loggerInfo).toHaveBeenNthCalledWith(2, 'Waiting 5 seconds before bootstrap attempt 2...');
      expect(mocks.loggerInfo).toHaveBeenNthCalledWith(3, 'Waiting 5 seconds before bootstrap attempt 3...');
      expect(mocks.nexusFetch).toHaveBeenCalledTimes(3);
      expect(mocks.homeserverRequest).toHaveBeenCalledTimes(3);
      expect(mocks.nexusNotifications).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ unread: 0, lastRead: MOCK_LAST_READ });
    });
  });
});
