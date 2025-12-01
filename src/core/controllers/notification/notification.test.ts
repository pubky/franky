import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationController } from './notification';
import * as Core from '@/core';
import * as Config from '@/config';
import * as Libs from '@/libs';

const mockUserId = 'pubky-user-123' as Core.Pubky;

const mockAuthStore = (userId: Core.Pubky = mockUserId) => {
  vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue({
    selectCurrentUserPubky: () => userId,
  } as ReturnType<typeof Core.useAuthStore.getState>);
};

describe('NotificationController', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  describe('notifications', () => {
    const setupNotificationStore = (lastRead: number) => {
      const selectLastRead = vi.fn(() => lastRead);
      const setUnread = vi.fn();
      vi.spyOn(Core.useNotificationStore, 'getState').mockReturnValue({
        selectLastRead,
        setUnread,
      } as unknown as Core.NotificationStore);
      return { selectLastRead, setUnread };
    };

    it('should poll notifications and update store with unread count', async () => {
      const { selectLastRead, setUnread } = setupNotificationStore(1234);
      const notificationsSpy = vi.spyOn(Core.NotificationApplication, 'notifications').mockResolvedValue(5);

      await NotificationController.notifications({ userId: mockUserId });

      expect(selectLastRead).toHaveBeenCalled();
      expect(notificationsSpy).toHaveBeenCalledWith({ userId: mockUserId, lastRead: 1234 });
      expect(setUnread).toHaveBeenCalledWith(5);
    });

    it('should bubble errors and not update store', async () => {
      const { setUnread } = setupNotificationStore(1234);
      vi.spyOn(Core.NotificationApplication, 'notifications').mockRejectedValue(new Error('poll-fail'));

      await expect(NotificationController.notifications({ userId: mockUserId })).rejects.toThrow('poll-fail');
      expect(setUnread).not.toHaveBeenCalled();
    });
  });

  describe('getOrFetchNotifications', () => {
    const mockResponse: Core.TGetOrFetchNotificationsResponse = {
      notifications: [
        { type: Core.NotificationType.Follow, timestamp: 3000, followed_by: 'user-1' },
      ] as Core.FlatNotification[],
      olderThan: 3000,
    };

    beforeEach(() => mockAuthStore());

    it.each([
      { params: {}, expectedOlderThan: Infinity, expectedLimit: Config.NEXUS_NOTIFICATIONS_LIMIT },
      { params: { olderThan: 5000 }, expectedOlderThan: 5000, expectedLimit: Config.NEXUS_NOTIFICATIONS_LIMIT },
      { params: { limit: 50 }, expectedOlderThan: Infinity, expectedLimit: 50 },
      { params: { olderThan: 8000, limit: 20 }, expectedOlderThan: 8000, expectedLimit: 20 },
    ])('should call application with params: $params', async ({ params, expectedOlderThan, expectedLimit }) => {
      const spy = vi.spyOn(Core.NotificationApplication, 'getOrFetchNotifications').mockResolvedValue(mockResponse);

      await NotificationController.getOrFetchNotifications(params);

      expect(spy).toHaveBeenCalledWith({
        userId: mockUserId,
        olderThan: expectedOlderThan,
        limit: expectedLimit,
      });
    });

    it('should return response from application', async () => {
      vi.spyOn(Core.NotificationApplication, 'getOrFetchNotifications').mockResolvedValue(mockResponse);

      const result = await NotificationController.getOrFetchNotifications({});

      expect(result).toEqual(mockResponse);
    });

    it('should return empty response when no notifications', async () => {
      vi.spyOn(Core.NotificationApplication, 'getOrFetchNotifications').mockResolvedValue({
        notifications: [],
        olderThan: undefined,
      });

      const result = await NotificationController.getOrFetchNotifications({});

      expect(result.notifications).toHaveLength(0);
      expect(result.olderThan).toBeUndefined();
    });

    it('should bubble errors from application', async () => {
      vi.spyOn(Core.NotificationApplication, 'getOrFetchNotifications').mockRejectedValue(new Error('fetch-fail'));

      await expect(NotificationController.getOrFetchNotifications({})).rejects.toThrow('fetch-fail');
    });
  });

  describe('markAllAsRead', () => {
    const mockTimestamp = 1234567890;

    const setupStores = (pubky: Core.Pubky | null) => {
      const setLastRead = vi.fn();
      const setUnread = vi.fn();

      vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue({
        selectCurrentUserPubky: () => pubky,
      } as unknown as ReturnType<typeof Core.useAuthStore.getState>);

      vi.spyOn(Core.useNotificationStore, 'getState').mockReturnValue({
        setLastRead,
        setUnread,
      } as unknown as Core.NotificationStore);

      return { setLastRead, setUnread };
    };

    it('should call application and update local store', () => {
      const { setLastRead, setUnread } = setupStores(mockUserId);
      const applicationSpy = vi.spyOn(Core.NotificationApplication, 'markAllAsRead').mockReturnValue(mockTimestamp);

      NotificationController.markAllAsRead();

      expect(applicationSpy).toHaveBeenCalledWith(mockUserId);
      expect(setLastRead).toHaveBeenCalledWith(mockTimestamp);
      expect(setUnread).toHaveBeenCalledWith(0);
    });

    it('should not call application when no user is authenticated', () => {
      const { setLastRead, setUnread } = setupStores(null);
      const loggerWarnSpy = vi.spyOn(Libs.Logger, 'warn').mockImplementation(() => {});
      const applicationSpy = vi.spyOn(Core.NotificationApplication, 'markAllAsRead');

      NotificationController.markAllAsRead();

      expect(loggerWarnSpy).toHaveBeenCalledWith('Cannot mark notifications as read: no authenticated user');
      expect(applicationSpy).not.toHaveBeenCalled();
      expect(setLastRead).not.toHaveBeenCalled();
      expect(setUnread).not.toHaveBeenCalled();
    });
  });
});
