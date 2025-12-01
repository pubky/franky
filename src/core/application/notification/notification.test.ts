import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { NotificationApplication } from './notification';

const userId = 'pubky_user' as Core.Pubky;

const createFlat = (timestamp: number): Core.FlatNotification =>
  ({ type: Core.NotificationType.Follow, timestamp, followed_by: `user-${timestamp}` }) as Core.FlatNotification;

const createNexus = (timestamp: number): Core.NexusNotification => ({
  timestamp,
  body: { type: Core.NotificationType.Follow, followed_by: `user-${timestamp}` },
});

const mockNormalizer = () =>
  vi.spyOn(Core.NotificationNormalizer, 'toFlatNotification').mockImplementation((n) => createFlat(n.timestamp));

describe('NotificationApplication.notifications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should fetch, persist, and return unread count', async () => {
    const notifications = [createNexus(2000), createNexus(1000)];
    const nexusSpy = vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue(notifications);
    const persistSpy = vi.spyOn(Core.LocalNotificationService, 'persistAndGetUnreadCount').mockResolvedValue(1);

    const unread = await NotificationApplication.notifications({ userId, lastRead: 1234 });

    expect(nexusSpy).toHaveBeenCalledWith({ user_id: userId, end: 1234 });
    expect(persistSpy).toHaveBeenCalledWith(notifications, 1234);
    expect(unread).toBe(1);
  });

  it('should bubble Nexus errors without persisting', async () => {
    vi.spyOn(Core.NexusUserService, 'notifications').mockRejectedValue(new Error('nexus-fail'));
    const persistSpy = vi.spyOn(Core.LocalNotificationService, 'persistAndGetUnreadCount');

    await expect(NotificationApplication.notifications({ userId, lastRead: 1234 })).rejects.toThrow('nexus-fail');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('should bubble persist errors', async () => {
    vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue([]);
    vi.spyOn(Core.LocalNotificationService, 'persistAndGetUnreadCount').mockRejectedValue(new Error('persist-fail'));

    await expect(NotificationApplication.notifications({ userId, lastRead: 1234 })).rejects.toThrow('persist-fail');
  });
});

describe('NotificationApplication.getOrFetchNotifications', () => {
  const limit = 10;

  beforeEach(() => vi.clearAllMocks());

  describe('full cache hit', () => {
    it('should return cached notifications without calling Nexus', async () => {
      const cached = Array.from({ length: limit }, (_, i) => createFlat(1000 - i * 10));
      vi.spyOn(Core.LocalNotificationService, 'getOlderThan').mockResolvedValue(cached);
      const nexusSpy = vi.spyOn(Core.NexusUserService, 'notifications');

      const result = await NotificationApplication.getOrFetchNotifications({ userId, olderThan: Infinity, limit });

      expect(result.notifications).toEqual(cached);
      expect(result.olderThan).toBe(cached[cached.length - 1].timestamp);
      expect(nexusSpy).not.toHaveBeenCalled();
    });
  });

  describe('cache miss', () => {
    beforeEach(() => {
      vi.spyOn(Core.LocalNotificationService, 'getOlderThan').mockResolvedValue([]);
    });

    it('should fetch from Nexus and persist', async () => {
      const nexusData = [createNexus(500), createNexus(400)];
      vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue(nexusData);
      mockNormalizer();
      const bulkSaveSpy = vi.spyOn(Core.NotificationModel, 'bulkSave').mockResolvedValue(undefined);

      const result = await NotificationApplication.getOrFetchNotifications({ userId, olderThan: Infinity, limit });

      expect(result.notifications).toHaveLength(2);
      expect(bulkSaveSpy).toHaveBeenCalledOnce();
    });

    it.each([
      { olderThan: Infinity, expectedEnd: undefined },
      { olderThan: 5000, expectedEnd: 5000 },
    ])('should pass end=$expectedEnd when olderThan=$olderThan', async ({ olderThan, expectedEnd }) => {
      const nexusSpy = vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue([]);

      await NotificationApplication.getOrFetchNotifications({ userId, olderThan, limit });

      expect(nexusSpy).toHaveBeenCalledWith({ user_id: userId, end: expectedEnd, limit });
    });

    it.each([
      { nexusResponse: [], desc: 'empty array' },
      { nexusResponse: null as unknown as Core.NexusNotification[], desc: 'null' },
    ])('should return empty response when Nexus returns $desc', async ({ nexusResponse }) => {
      vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue(nexusResponse);

      const result = await NotificationApplication.getOrFetchNotifications({ userId, olderThan: Infinity, limit });

      expect(result.notifications).toHaveLength(0);
      expect(result.olderThan).toBeUndefined();
    });
  });

  describe('partial cache hit', () => {
    it('should combine cached and fetched notifications', async () => {
      const cached = [createFlat(1000), createFlat(900)];
      const nexusData = [createNexus(800), createNexus(700)];

      vi.spyOn(Core.LocalNotificationService, 'getOlderThan').mockResolvedValue(cached);
      vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue(nexusData);
      mockNormalizer();
      vi.spyOn(Core.NotificationModel, 'bulkSave').mockResolvedValue(undefined);

      const result = await NotificationApplication.getOrFetchNotifications({ userId, olderThan: Infinity, limit: 10 });

      expect(result.notifications.map((n) => n.timestamp)).toEqual([1000, 900, 800, 700]);
    });

    it('should fetch remaining with correct limit using last cached timestamp', async () => {
      const cached = [createFlat(1000), createFlat(900)];
      vi.spyOn(Core.LocalNotificationService, 'getOlderThan').mockResolvedValue(cached);
      const nexusSpy = vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue([]);

      await NotificationApplication.getOrFetchNotifications({ userId, olderThan: Infinity, limit: 10 });

      expect(nexusSpy).toHaveBeenCalledWith({ user_id: userId, end: 900, limit: 8 });
    });

    it('should deduplicate by timestamp', async () => {
      const cached = [createFlat(1000), createFlat(900)];
      const nexusData = [createNexus(900), createNexus(800)]; // 900 is duplicate

      vi.spyOn(Core.LocalNotificationService, 'getOlderThan').mockResolvedValue(cached);
      vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue(nexusData);
      mockNormalizer();
      vi.spyOn(Core.NotificationModel, 'bulkSave').mockResolvedValue(undefined);

      const result = await NotificationApplication.getOrFetchNotifications({ userId, olderThan: Infinity, limit: 10 });

      expect(result.notifications.map((n) => n.timestamp)).toEqual([1000, 900, 800]);
    });
  });

  describe('error handling', () => {
    it('should log warning and return empty on Nexus failure', async () => {
      vi.spyOn(Core.LocalNotificationService, 'getOlderThan').mockResolvedValue([]);
      vi.spyOn(Core.NexusUserService, 'notifications').mockRejectedValue(new Error('network-error'));
      const loggerSpy = vi.spyOn(Libs.Logger, 'warn').mockImplementation(() => {});

      const result = await NotificationApplication.getOrFetchNotifications({ userId, olderThan: Infinity, limit });

      expect(result).toEqual({ notifications: [], olderThan: undefined });
      expect(loggerSpy).toHaveBeenCalledWith('Failed to fetch notifications from Nexus', expect.any(Object));
    });

    it('should not throw on bulkSave failure (fire and forget)', async () => {
      vi.spyOn(Core.LocalNotificationService, 'getOlderThan').mockResolvedValue([]);
      vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue([createNexus(1000)]);
      mockNormalizer();
      vi.spyOn(Core.NotificationModel, 'bulkSave').mockRejectedValue(new Error('db-error'));

      const result = await NotificationApplication.getOrFetchNotifications({ userId, olderThan: Infinity, limit });

      expect(result.notifications).toHaveLength(1);
    });
  });
});

describe('NotificationApplication.markAllAsRead', () => {
  const mockTimestamp = 1234567890;
  const mockLastReadUrl = 'pubky://test-user/pub/pubky.app/last-read';

  beforeEach(() => vi.clearAllMocks());

  it('should create lastRead and send to homeserver', () => {
    const mockLastReadResult = {
      last_read: {
        timestamp: BigInt(mockTimestamp),
        toJson: vi.fn().mockReturnValue({ timestamp: mockTimestamp }),
      },
      meta: { url: mockLastReadUrl },
    };

    vi.spyOn(Core.LastReadNormalizer, 'to').mockReturnValue(
      mockLastReadResult as unknown as ReturnType<typeof Core.LastReadNormalizer.to>,
    );
    const homeserverSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined);

    const result = NotificationApplication.markAllAsRead(userId);

    expect(Core.LastReadNormalizer.to).toHaveBeenCalledWith(userId);
    expect(homeserverSpy).toHaveBeenCalledWith(
      Core.HomeserverAction.PUT,
      mockLastReadUrl,
      mockLastReadResult.last_read.toJson(),
    );
    expect(result).toBe(mockTimestamp);
  });

  it('should return timestamp even if homeserver fails (fire and forget)', async () => {
    const mockLastReadResult = {
      last_read: {
        timestamp: BigInt(mockTimestamp),
        toJson: vi.fn().mockReturnValue({ timestamp: mockTimestamp }),
      },
      meta: { url: mockLastReadUrl },
    };

    vi.spyOn(Core.LastReadNormalizer, 'to').mockReturnValue(
      mockLastReadResult as unknown as ReturnType<typeof Core.LastReadNormalizer.to>,
    );
    vi.spyOn(Core.HomeserverService, 'request').mockRejectedValue(new Error('homeserver-fail'));
    const loggerWarnSpy = vi.spyOn(Libs.Logger, 'warn').mockImplementation(() => {});

    const result = NotificationApplication.markAllAsRead(userId);

    expect(result).toBe(mockTimestamp);

    // Wait for the catch to execute
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(loggerWarnSpy).toHaveBeenCalledWith('Failed to update lastRead on homeserver', { error: expect.any(Error) });
  });
});

describe('NotificationApplication.getAllFromCache', () => {
  const createFlat = (timestamp: number): Core.FlatNotification =>
    ({ type: Core.NotificationType.Follow, timestamp, followed_by: `user-${timestamp}` }) as Core.FlatNotification;

  beforeEach(() => vi.clearAllMocks());

  it('should delegate to LocalNotificationService.getAll', async () => {
    const expected = [createFlat(3000), createFlat(2000), createFlat(1000)];
    const serviceSpy = vi.spyOn(Core.LocalNotificationService, 'getAll').mockResolvedValue(expected);

    const result = await NotificationApplication.getAllFromCache();

    expect(serviceSpy).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('should return empty array when no notifications exist', async () => {
    vi.spyOn(Core.LocalNotificationService, 'getAll').mockResolvedValue([]);

    const result = await NotificationApplication.getAllFromCache();

    expect(result).toEqual([]);
  });

  it('should bubble service errors', async () => {
    vi.spyOn(Core.LocalNotificationService, 'getAll').mockRejectedValue(new Error('service-fail'));

    await expect(NotificationApplication.getAllFromCache()).rejects.toThrow('service-fail');
  });
});

describe('NotificationApplication.getOrFetchNotifications - with types filter', () => {
  const limit = 10;

  const createReply = (timestamp: number): Core.FlatNotification =>
    ({
      type: Core.NotificationType.Reply,
      timestamp,
      replied_by: `user-${timestamp}`,
      parent_post_uri: 'post123',
      reply_uri: 'reply456',
    }) as Core.FlatNotification;

  beforeEach(() => vi.clearAllMocks());

  describe('null/empty types (ALL tab)', () => {
    it('should use getOlderThan when types is null', async () => {
      const cached = Array.from({ length: limit }, (_, i) => createFlat(1000 - i * 10));
      const olderThanSpy = vi.spyOn(Core.LocalNotificationService, 'getOlderThan').mockResolvedValue(cached);
      const byTypesSpy = vi.spyOn(Core.LocalNotificationService, 'getOlderThanByTypes');

      const result = await NotificationApplication.getOrFetchNotifications({
        userId,
        types: null,
        olderThan: Infinity,
        limit,
      });

      expect(result.notifications).toEqual(cached);
      expect(olderThanSpy).toHaveBeenCalled();
      expect(byTypesSpy).not.toHaveBeenCalled();
    });

    it('should use getOlderThan when types is empty array', async () => {
      const cached = Array.from({ length: limit }, (_, i) => createFlat(1000 - i * 10));
      const olderThanSpy = vi.spyOn(Core.LocalNotificationService, 'getOlderThan').mockResolvedValue(cached);
      const byTypesSpy = vi.spyOn(Core.LocalNotificationService, 'getOlderThanByTypes');

      const result = await NotificationApplication.getOrFetchNotifications({
        userId,
        types: [],
        olderThan: Infinity,
        limit,
      });

      expect(result.notifications).toEqual(cached);
      expect(olderThanSpy).toHaveBeenCalled();
      expect(byTypesSpy).not.toHaveBeenCalled();
    });
  });

  describe('full cache hit with types', () => {
    it('should return cached type-filtered notifications without calling Nexus', async () => {
      const cached = Array.from({ length: limit }, (_, i) => createReply(1000 - i * 10));
      vi.spyOn(Core.LocalNotificationService, 'getOlderThanByTypes').mockResolvedValue(cached);
      const nexusSpy = vi.spyOn(Core.NexusUserService, 'notifications');

      const result = await NotificationApplication.getOrFetchNotifications({
        userId,
        types: [Core.NotificationType.Reply],
        olderThan: Infinity,
        limit,
      });

      expect(result.notifications).toEqual(cached);
      expect(result.olderThan).toBe(cached[cached.length - 1].timestamp);
      expect(nexusSpy).not.toHaveBeenCalled();
    });
  });

  describe('partial cache hit with types', () => {
    it('should fetch from Nexus and filter by types when cache is partial', async () => {
      const cached = [createReply(1000), createReply(900)];
      const nexusData = [
        createNexus(800), // Follow - should be filtered out
        {
          timestamp: 700,
          body: { type: Core.NotificationType.Reply, replied_by: 'user-700', parent_post_uri: 'p', reply_uri: 'r' },
        },
      ];

      vi.spyOn(Core.LocalNotificationService, 'getOlderThanByTypes').mockResolvedValue(cached);
      vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue(nexusData as Core.NexusNotification[]);
      mockNormalizer();
      vi.spyOn(Core.NotificationModel, 'bulkSave').mockResolvedValue(undefined);

      const result = await NotificationApplication.getOrFetchNotifications({
        userId,
        types: [Core.NotificationType.Reply],
        olderThan: Infinity,
        limit: 10,
      });

      // Should have cached + filtered nexus (only Reply type from nexus)
      expect(result.notifications.length).toBeGreaterThanOrEqual(2);
      expect(
        result.notifications.every(
          (n) => n.type === Core.NotificationType.Reply || n.type === Core.NotificationType.Follow,
        ),
      ).toBe(true);
    });
  });

  describe('cache miss with types', () => {
    it('should fetch from Nexus and filter when cache is empty', async () => {
      vi.spyOn(Core.LocalNotificationService, 'getOlderThanByTypes').mockResolvedValue([]);
      vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue([
        {
          timestamp: 1000,
          body: { type: Core.NotificationType.Reply, replied_by: 'user-1', parent_post_uri: 'p', reply_uri: 'r' },
        },
        { timestamp: 900, body: { type: Core.NotificationType.Follow, followed_by: 'user-2' } },
        { timestamp: 800, body: { type: Core.NotificationType.Mention, mentioned_by: 'user-3', post_uri: 'p' } },
      ] as Core.NexusNotification[]);
      vi.spyOn(Core.NotificationNormalizer, 'toFlatNotification').mockImplementation(
        (n) =>
          ({
            ...n.body,
            timestamp: n.timestamp,
          }) as Core.FlatNotification,
      );
      vi.spyOn(Core.NotificationModel, 'bulkSave').mockResolvedValue(undefined);

      const result = await NotificationApplication.getOrFetchNotifications({
        userId,
        types: [Core.NotificationType.Reply, Core.NotificationType.Mention],
        olderThan: Infinity,
        limit: 10,
      });

      // Should only include Reply and Mention
      expect(
        result.notifications.every(
          (n) => n.type === Core.NotificationType.Reply || n.type === Core.NotificationType.Mention,
        ),
      ).toBe(true);
    });

    it('should return empty when no matching types exist', async () => {
      vi.spyOn(Core.LocalNotificationService, 'getOlderThanByTypes').mockResolvedValue([]);
      vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue([
        { timestamp: 1000, body: { type: Core.NotificationType.Follow, followed_by: 'user-1' } },
      ] as Core.NexusNotification[]);
      vi.spyOn(Core.NotificationNormalizer, 'toFlatNotification').mockImplementation(
        (n) =>
          ({
            ...n.body,
            timestamp: n.timestamp,
          }) as Core.FlatNotification,
      );
      vi.spyOn(Core.NotificationModel, 'bulkSave').mockResolvedValue(undefined);

      const result = await NotificationApplication.getOrFetchNotifications({
        userId,
        types: [Core.NotificationType.Reply],
        olderThan: Infinity,
        limit: 10,
      });

      expect(result.notifications).toHaveLength(0);
    });
  });
});
