import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import { NotificationApplication } from './notification';

describe('NotificationApplication.notifications', () => {
  const userId = 'pubky_user' as Core.Pubky;
  const lastRead = 1234;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch notifications, persist, and return unread count', async () => {
    const notifications = [
      { timestamp: 2000, body: { type: 'a' } },
      { timestamp: 1000, body: { type: 'b' } },
    ] as unknown as Core.NexusNotification[];

    const nexusSpy = vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue(notifications);
    const persistSpy = vi.spyOn(Core.LocalNotificationService, 'persitAndGetUnreadCount').mockResolvedValue(1);

    const unread = await NotificationApplication.notifications({ userId, lastRead });

    expect(nexusSpy).toHaveBeenCalledWith({ user_id: userId, end: lastRead });
    expect(persistSpy).toHaveBeenCalledWith(notifications, lastRead);
    expect(unread).toBe(1);
  });

  it('should bubble when NexusUserService.notifications fails and not persist', async () => {
    const nexusSpy = vi.spyOn(Core.NexusUserService, 'notifications').mockRejectedValue(new Error('nexus-fail'));
    const persistSpy = vi.spyOn(Core.LocalNotificationService, 'persitAndGetUnreadCount').mockResolvedValue(0);

    await expect(NotificationApplication.notifications({ userId, lastRead })).rejects.toThrow('nexus-fail');

    expect(nexusSpy).toHaveBeenCalledWith({ user_id: userId, end: lastRead });
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('should bubble when persisting unread count fails', async () => {
    vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue([] as unknown as Core.NexusNotification[]);
    const persistSpy = vi
      .spyOn(Core.LocalNotificationService, 'persitAndGetUnreadCount')
      .mockRejectedValue(new Error('persist-fail'));

    await expect(NotificationApplication.notifications({ userId, lastRead })).rejects.toThrow('persist-fail');

    expect(persistSpy).toHaveBeenCalledOnce();
  });
});

