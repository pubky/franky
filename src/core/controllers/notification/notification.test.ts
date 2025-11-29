import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationController } from './notification';
import * as Core from '@/core';

describe('NotificationController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('notifications', () => {
    it('should poll notifications using lastRead and update unread count in store', async () => {
      const userId = 'pubky-user' as unknown as Core.Pubky;
      const lastRead = 1234;
      const unread = 5;

      // Configure mocked selectors/actions for this test run via spying on the store
      const selectLastRead = vi.fn(() => lastRead);
      const setUnread = vi.fn();
      vi.spyOn(Core.useNotificationStore, 'getState').mockReturnValue({
        selectLastRead,
        setUnread,
      } as unknown as import('@/core/stores/notification/notification.types').NotificationStore);

      const notificationsSpy = vi.spyOn(Core.NotificationApplication, 'notifications').mockResolvedValue(unread);

      await NotificationController.notifications({ userId });

      expect(selectLastRead).toHaveBeenCalled();
      expect(notificationsSpy).toHaveBeenCalledWith({ userId, lastRead });
      expect(setUnread).toHaveBeenCalledWith(unread);
    });

    it('should bubble when notifications fails and not set unread', async () => {
      const userId = 'pubky-user' as unknown as Core.Pubky;
      const lastRead = 1234;

      const selectLastRead = vi.fn(() => lastRead);
      const setUnread = vi.fn();
      vi.spyOn(Core.useNotificationStore, 'getState').mockReturnValue({
        selectLastRead,
        setUnread,
      } as unknown as import('@/core/stores/notification/notification.types').NotificationStore);

      vi.spyOn(Core.NotificationApplication, 'notifications').mockRejectedValue(new Error('poll-fail'));

      await expect(NotificationController.notifications({ userId })).rejects.toThrow('poll-fail');

      expect(selectLastRead).toHaveBeenCalled();
      expect(setUnread).not.toHaveBeenCalled();
    });
  });
});

