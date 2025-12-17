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
  ids: { stream: [], influencers: [], recommended: [], hot_tags: [] },
  indexed: true,
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
  ids: {
    stream: ['post-1'],
    influencers: ['user-1'],
    recommended: ['user-2'],
    hot_tags: [{ label: 'technology', taggers_id: ['user-1'], tagged_count: 1, taggers_count: 1 }],
  },
  indexed: true,
});

const createMockNotification = (): Core.NexusNotification => ({
  timestamp: Date.now(),
  body: { type: 'like', user_id: 'user-2', post_id: 'post-1' },
});

const createFlatNotification = (timestamp: number): Core.FlatNotification =>
  ({
    type: Core.NotificationType.Follow,
    timestamp,
    followed_by: `user-${timestamp}`,
  }) as Core.FlatNotification;

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
  upsertInfluencersError?: Error;
  upsertTagsError?: Error;
  persistFilesError?: Error;
  fetchMissingEntitiesError?: Error;
  persistNotificationsError?: Error;
};

type ServiceMocks = {
  nexusFetch: unknown;
  homeserverRequest: unknown;
  nexusNotifications: unknown;
  persistUsers: unknown;
  persistPosts: unknown;
  persistFiles: unknown;
  upsertPostsStream: unknown;
  upsertInfluencersStream: unknown;
  upsertHotTags: unknown;
  upsertTagsStream: unknown;
  fetchMissingEntities: unknown;
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
    upsertInfluencersError,
    upsertTagsError,
    persistFilesError,
    fetchMissingEntitiesError,
    persistNotificationsError,
  } = config;

  vi.clearAllMocks();

  const flatNotifications = notifications.map((n) => createFlatNotification(n.timestamp));

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
      .mockImplementation(persistUsersError ? () => Promise.reject(persistUsersError) : () => Promise.resolve([])),
    persistPosts: vi
      .spyOn(Core.LocalStreamPostsService, 'persistPosts')
      .mockImplementation(
        persistPostsError ? () => Promise.reject(persistPostsError) : () => Promise.resolve({ postAttachments: [] }),
      ),
    persistFiles: vi
      .spyOn(Core.FileApplication, 'fetchFiles')
      .mockImplementation(
        persistFilesError ? () => Promise.reject(persistFilesError) : () => Promise.resolve(undefined),
      ),
    upsertPostsStream: vi
      .spyOn(Core.LocalStreamPostsService, 'upsert')
      .mockImplementation(upsertPostsError ? () => Promise.reject(upsertPostsError) : () => Promise.resolve(undefined)),
    upsertInfluencersStream: vi
      .spyOn(Core.LocalStreamUsersService, 'upsert')
      .mockImplementation(
        upsertInfluencersError ? () => Promise.reject(upsertInfluencersError) : () => Promise.resolve(undefined),
      ),
    upsertHotTags: vi.spyOn(Core.LocalHotService, 'upsert').mockResolvedValue(undefined),
    upsertTagsStream: vi
      .spyOn(Core.LocalStreamTagsService, 'upsert')
      .mockImplementation(upsertTagsError ? () => Promise.reject(upsertTagsError) : () => Promise.resolve(undefined)),
    fetchMissingEntities: vi
      .spyOn(Core.NotificationApplication, 'fetchMissingEntities')
      .mockImplementation(
        fetchMissingEntitiesError
          ? () => Promise.reject(fetchMissingEntitiesError)
          : () => Promise.resolve(flatNotifications),
      ),
    persistNotifications: vi
      .spyOn(Core.LocalNotificationService, 'persistAndGetUnreadCount')
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
  expect(mocks.persistPosts).toHaveBeenCalledWith({ posts: bootstrapData.posts });
  expect(mocks.upsertPostsStream).toHaveBeenCalledWith({
    streamId: Core.PostStreamTypes.TIMELINE_ALL_ALL,
    stream: bootstrapData.ids.stream,
  });
  // Check user streams are stored with UserStreamTypes directly
  expect(mocks.upsertInfluencersStream).toHaveBeenCalledWith({
    streamId: Core.UserStreamTypes.TODAY_INFLUENCERS_ALL,
    stream: bootstrapData.ids.influencers,
  });
  expect(mocks.upsertInfluencersStream).toHaveBeenCalledWith({
    streamId: Core.UserStreamTypes.RECOMMENDED,
    stream: bootstrapData.ids.recommended,
  });
  // Check both hot tags features are called
  expect(mocks.upsertHotTags).toHaveBeenCalledWith(
    Core.buildHotTagsId(Core.UserStreamTimeframe.TODAY, 'all'),
    bootstrapData.ids.hot_tags,
  );
  expect(mocks.upsertTagsStream).toHaveBeenCalledWith(Core.TagStreamTypes.TODAY_ALL, bootstrapData.ids.hot_tags);
  // fetchMissingEntities is called with notifications and viewerId
  expect(mocks.fetchMissingEntities).toHaveBeenCalledWith({ notifications, viewerId: TEST_PUBKY });
  // persistAndGetUnreadCount is called with a single object parameter
  const flatNotifications = notifications.map((n) => createFlatNotification(n.timestamp));
  expect(mocks.persistNotifications).toHaveBeenCalledWith({ flatNotifications, lastRead: MOCK_LAST_READ });
};

describe('BootstrapApplication', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.spyOn(Core.NotificationNormalizer, 'to').mockReturnValue({
      meta: { url: MOCK_LAST_READ_URL },
    } as LastReadResult);
    // Mock toFlatNotification to convert NexusNotification to FlatNotification
    vi.spyOn(Core.NotificationNormalizer, 'toFlatNotification').mockImplementation((n) =>
      createFlatNotification(n.timestamp),
    );
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
      expect(result).toEqual({ notification: { unread: 1, lastRead: MOCK_LAST_READ } });
    });

    it('should throw error when NexusBootstrapService fails', async () => {
      const mocks = setupMocks({ bootstrapError: new Error('Network error') });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toThrow('Network error');

      expect(mocks.nexusFetch).toHaveBeenCalledWith(TEST_PUBKY);
      expect(mocks.persistUsers).not.toHaveBeenCalled();
    });

    it('should throw NO_CONTENT AppError when bootstrap data is empty (null)', async () => {
      const mocks = setupMocks({ bootstrapData: null });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toMatchObject({
        name: 'AppError',
        type: Libs.NexusErrorType.NO_CONTENT,
        statusCode: 204,
        message: 'No content found for bootstrap data',
      });

      expect(mocks.persistUsers).not.toHaveBeenCalled();
    });

    it('should throw error when LocalPersistenceService fails', async () => {
      const bootstrapData = emptyBootstrap();
      const mocks = setupMocks({ bootstrapData, persistUsersError: new Error('Database error') });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toThrow('Database error');

      expect(mocks.persistUsers).toHaveBeenCalledWith(bootstrapData.users);
    });

    it('should handle empty bootstrap data', async () => {
      const bootstrapData = emptyBootstrap();
      const mocks = setupMocks({ bootstrapData });

      const result = await BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY));

      assertCommonCalls(mocks, bootstrapData, []);
      expect(result).toEqual({ notification: { unread: 0, lastRead: MOCK_LAST_READ } });
    });

    it('should handle 404 homeserver error gracefully and create new lastRead', async () => {
      const bootstrapData = emptyBootstrap();
      const MOCK_NORMALIZED_TIMESTAMP = 9876543210;
      const MOCK_NORMALIZED_LAST_READ_URL = 'pubky://test-pubky/pub/pubky.app/last-read';
      const mockLastReadResult = {
        last_read: {
          timestamp: MOCK_NORMALIZED_TIMESTAMP,
          toJson: vi.fn(() => ({ timestamp: MOCK_NORMALIZED_TIMESTAMP })),
        },
        meta: { url: MOCK_NORMALIZED_LAST_READ_URL },
      };

      const mocks = setupMocks({ bootstrapData });
      // Override homeserver mock to reject on GET with 404 error but allow PUT
      const homeserverRequestSpy = vi.spyOn(Core.HomeserverService, 'request').mockImplementation((action, url) => {
        if (action === Core.HomeserverAction.GET) {
          return Promise.reject(
            Libs.createHomeserverError(Libs.HomeserverErrorType.FETCH_FAILED, 'Not found', 404, { url }),
          );
        }
        // Allow PUT to succeed (fire and forget)
        return Promise.resolve(undefined);
      });
      mocks.homeserverRequest = homeserverRequestSpy;

      const lastReadNormalizerSpy = vi
        .spyOn(Core.LastReadNormalizer, 'to')
        .mockReturnValue(mockLastReadResult as unknown as LastReadResult);
      const loggerInfoSpy = vi.spyOn(Libs.Logger, 'info').mockImplementation(() => {});

      const result = await BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY));

      // Verify error was logged as info (not error) since 404 is expected for new users
      expect(loggerInfoSpy).toHaveBeenCalledWith('Last read file not found, creating new one', { pubky: TEST_PUBKY });

      // Verify LastReadNormalizer was called to create new lastRead
      expect(lastReadNormalizerSpy).toHaveBeenCalledWith(TEST_PUBKY);

      // Verify GET request failed (first call)
      expect(homeserverRequestSpy).toHaveBeenCalledWith(Core.HomeserverAction.GET, MOCK_LAST_READ_URL);

      // Verify PUT request was made to homeserver (fire and forget)
      expect(homeserverRequestSpy).toHaveBeenCalledWith(
        Core.HomeserverAction.PUT,
        MOCK_NORMALIZED_LAST_READ_URL,
        mockLastReadResult.last_read.toJson(),
      );

      // Verify notifications were still fetched (homeserver failure only affects lastRead, not notifications)
      expect(mocks.nexusNotifications).toHaveBeenCalledWith({ user_id: TEST_PUBKY, limit: 30 });

      // Verify bootstrap data was still processed
      expect(mocks.persistUsers).toHaveBeenCalledWith(bootstrapData.users);
      expect(mocks.persistPosts).toHaveBeenCalledWith({ posts: bootstrapData.posts });

      // Verify result has empty notification list and normalized timestamp
      expect(result).toEqual({
        notification: { unread: 0, lastRead: MOCK_NORMALIZED_TIMESTAMP },
      });
    });

    it('should throw error when homeserver returns 500 error', async () => {
      const bootstrapData = emptyBootstrap();
      const mocks = setupMocks({ bootstrapData });

      // Override homeserver mock to reject with 500 error
      const homeserverRequestSpy = vi.spyOn(Core.HomeserverService, 'request').mockImplementation((action, url) => {
        if (action === Core.HomeserverAction.GET) {
          return Promise.reject(
            Libs.createHomeserverError(Libs.HomeserverErrorType.FETCH_FAILED, 'Internal server error', 500, { url }),
          );
        }
        return Promise.resolve(undefined);
      });
      mocks.homeserverRequest = homeserverRequestSpy;

      const loggerErrorSpy = vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toMatchObject({
        type: Libs.HomeserverErrorType.FETCH_FAILED,
        statusCode: 500,
        message: 'Internal server error',
      });

      // Verify error was logged
      expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to fetch last read timestamp', expect.any(Error));

      // Verify GET request was attempted
      expect(homeserverRequestSpy).toHaveBeenCalledWith(Core.HomeserverAction.GET, MOCK_LAST_READ_URL);

      // Verify PUT was NOT called (error should bubble up, not create new lastRead)
      expect(homeserverRequestSpy).not.toHaveBeenCalledWith(
        Core.HomeserverAction.PUT,
        expect.any(String),
        expect.any(Object),
      );

      // Bootstrap data is persisted before notifications are fetched, so it will be persisted even if notifications fail
      expect(mocks.persistUsers).toHaveBeenCalledWith(bootstrapData.users);
    });

    it('should throw error when homeserver returns network error', async () => {
      const bootstrapData = emptyBootstrap();
      const mocks = setupMocks({ bootstrapData });

      // Override homeserver mock to reject with network error (no status code)
      const homeserverRequestSpy = vi.spyOn(Core.HomeserverService, 'request').mockImplementation((action) => {
        if (action === Core.HomeserverAction.GET) {
          return Promise.reject(new Error('Network timeout'));
        }
        return Promise.resolve(undefined);
      });
      mocks.homeserverRequest = homeserverRequestSpy;

      const loggerErrorSpy = vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toThrow('Network timeout');

      // Verify error was logged
      expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to fetch last read timestamp', expect.any(Error));

      // Verify GET request was attempted
      expect(homeserverRequestSpy).toHaveBeenCalledWith(Core.HomeserverAction.GET, MOCK_LAST_READ_URL);

      // Verify PUT was NOT called (error should bubble up)
      expect(homeserverRequestSpy).not.toHaveBeenCalledWith(
        Core.HomeserverAction.PUT,
        expect.any(String),
        expect.any(Object),
      );

      // Bootstrap data is persisted before notifications are fetched, so it will be persisted even if notifications fail
      expect(mocks.persistUsers).toHaveBeenCalled();
    });

    it('should throw error when NexusUserService.notifications fails', async () => {
      const mocks = setupMocks({ notificationsError: new Error('Notifications error') });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toThrow(
        'Notifications error',
      );

      // Verify homeserver was called for GET (to get lastRead)
      expect(mocks.homeserverRequest).toHaveBeenCalledWith(Core.HomeserverAction.GET, MOCK_LAST_READ_URL);

      // Verify PUT was NOT called (should not write to homeserver when notifications fail)
      expect(mocks.homeserverRequest).not.toHaveBeenCalledWith(
        Core.HomeserverAction.PUT,
        expect.any(String),
        expect.any(Object),
      );

      // Bootstrap data is persisted before notifications are fetched, so it will be persisted even if notifications fail
      expect(mocks.persistUsers).toHaveBeenCalled();
    });

    it('should throw error when NotificationApplication.fetchMissingEntities fails', async () => {
      const bootstrapData = emptyBootstrap();
      const notifications = [createMockNotification()];
      const mocks = setupMocks({
        bootstrapData,
        notifications,
        fetchMissingEntitiesError: new Error('Fetch missing entities error'),
      });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toThrow(
        'Fetch missing entities error',
      );

      // Verify notifications were fetched
      expect(mocks.nexusNotifications).toHaveBeenCalledWith({ user_id: TEST_PUBKY, limit: 30 });

      // Verify fetchMissingEntities was called
      expect(mocks.fetchMissingEntities).toHaveBeenCalledWith({ notifications, viewerId: TEST_PUBKY });

      // Verify persistNotifications was NOT called (error occurred before)
      expect(mocks.persistNotifications).not.toHaveBeenCalled();
    });

    it('should throw error when persistPosts fails', async () => {
      const bootstrapData = emptyBootstrap();
      const mocks = setupMocks({ bootstrapData, persistPostsError: new Error('Posts persistence error') });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toThrow(
        'Posts persistence error',
      );

      expect(mocks.persistPosts).toHaveBeenCalledWith({ posts: bootstrapData.posts });
    });

    it('should throw error when upsert operations fail', async () => {
      const bootstrapData = emptyBootstrap();
      const mocks = setupMocks({ bootstrapData, upsertPostsError: new Error('Stream upsert error') });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toThrow(
        'Stream upsert error',
      );

      expect(mocks.upsertPostsStream).toHaveBeenCalledWith({
        streamId: Core.PostStreamTypes.TIMELINE_ALL_ALL,
        stream: bootstrapData.ids.stream,
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

      // Verify fetchMissingEntities was called first
      expect(mocks.fetchMissingEntities).toHaveBeenCalledWith({ notifications: [], viewerId: TEST_PUBKY });
      expect(mocks.persistNotifications).toHaveBeenCalledWith({ flatNotifications: [], lastRead: MOCK_LAST_READ });
    });

    it('should throw error when upsert influencers stream fails', async () => {
      const bootstrapData = emptyBootstrap();
      const mocks = setupMocks({
        bootstrapData,
        upsertInfluencersError: new Error('Influencers stream upsert error'),
      });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toThrow(
        'Influencers stream upsert error',
      );

      expect(mocks.upsertInfluencersStream).toHaveBeenCalledWith({
        streamId: Core.UserStreamTypes.TODAY_INFLUENCERS_ALL,
        stream: bootstrapData.ids.influencers,
      });
    });

    it('should throw error when upsert tags stream fails', async () => {
      const bootstrapData = emptyBootstrap();
      const mocks = setupMocks({
        bootstrapData,
        upsertTagsError: new Error('Tags stream upsert error'),
      });

      await expect(BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY))).rejects.toThrow(
        'Tags stream upsert error',
      );

      expect(mocks.upsertTagsStream).toHaveBeenCalledWith(Core.TagStreamTypes.TODAY_ALL, bootstrapData.ids.hot_tags);
    });

    it('should persist files from post attachments but not return them', async () => {
      const bootstrapData = createMockBootstrapData();
      const notifications = [createMockNotification()];
      const mockAttachments = [
        'pubky://user-1/pub/pubky.app/files/file-1',
        'pubky://user-1/pub/pubky.app/files/file-2',
      ];

      const mocks = setupMocks({ bootstrapData, notifications, unreadCount: 1 });
      // Override persistPosts mock to return specific attachments
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue({
        postAttachments: mockAttachments,
      });
      mocks.persistPosts = persistPostsSpy;

      const result = await BootstrapApplication.initialize(getBootstrapParams(TEST_PUBKY));

      // Verify files were persisted
      expect(mocks.persistFiles).toHaveBeenCalledWith(mockAttachments);
      // Verify result doesn't include filesUris
      expect(result).toEqual({ notification: { unread: 1, lastRead: MOCK_LAST_READ } });
    });
  });
});
