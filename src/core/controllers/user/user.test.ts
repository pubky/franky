import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserController } from './user';
import * as Core from '@/core';

describe('UserController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('follow', () => {
    it('should normalize follow request and delegate to UserApplication.follow (PUT)', async () => {
      const follower = 'pubky-follower' as unknown as Core.Pubky;
      const followee = 'pubky-followee' as unknown as Core.Pubky;

      const mockFollowJson = { foo: 'bar' } as Record<string, unknown>;
      const mockToJson = vi.fn(() => mockFollowJson);
      const mockMeta = { url: 'https://example.com/follow' } as { url: string };

      const toSpy = vi
        .spyOn(Core.FollowNormalizer, 'to')
        .mockResolvedValue({
          meta: mockMeta,
          follow: { toJson: mockToJson },
        } as unknown as import('pubky-app-specs').FollowResult);

      const followSpy = vi.spyOn(Core.UserApplication, 'follow').mockResolvedValue(undefined);

      await UserController.follow(Core.HomeserverAction.PUT, { follower, followee });

      expect(toSpy).toHaveBeenCalledWith({ follower, followee });
      expect(mockToJson).toHaveBeenCalled();
      expect(followSpy).toHaveBeenCalledWith({
        eventType: Core.HomeserverAction.PUT,
        followUrl: mockMeta.url,
        followJson: mockFollowJson,
        follower,
        followee,
      });
    });

    it('should support DELETE action and delegate correctly', async () => {
      const follower = 'pubky-follower' as unknown as Core.Pubky;
      const followee = 'pubky-followee' as unknown as Core.Pubky;

      const mockFollowJson = { baz: 1 } as Record<string, unknown>;
      const mockToJson = vi.fn(() => mockFollowJson);
      const mockMeta = { url: 'https://example.com/unfollow' } as { url: string };

      vi.spyOn(Core.FollowNormalizer, 'to').mockResolvedValue({
        meta: mockMeta,
        follow: { toJson: mockToJson },
      } as unknown as import('pubky-app-specs').FollowResult);

      const followSpy = vi.spyOn(Core.UserApplication, 'follow').mockResolvedValue(undefined);

      await UserController.follow(Core.HomeserverAction.DELETE, { follower, followee });

      expect(followSpy).toHaveBeenCalledWith({
        eventType: Core.HomeserverAction.DELETE,
        followUrl: mockMeta.url,
        followJson: mockFollowJson,
        follower,
        followee,
      });
    });

    it('should bubble when FollowNormalizer.to fails and not delegate', async () => {
      const follower = 'pubky-follower' as unknown as Core.Pubky;
      const followee = 'pubky-followee' as unknown as Core.Pubky;

      vi.spyOn(Core.FollowNormalizer, 'to').mockRejectedValue(new Error('normalize-fail'));
      const followSpy = vi.spyOn(Core.UserApplication, 'follow').mockResolvedValue(undefined);

      await expect(UserController.follow(Core.HomeserverAction.PUT, { follower, followee })).rejects.toThrow(
        'normalize-fail',
      );

      expect(followSpy).not.toHaveBeenCalled();
    });

    it('should bubble when UserApplication.follow fails', async () => {
      const follower = 'pubky-follower' as unknown as Core.Pubky;
      const followee = 'pubky-followee' as unknown as Core.Pubky;

      vi.spyOn(Core.FollowNormalizer, 'to').mockResolvedValue({
        meta: { url: 'https://example.com/follow' },
        follow: { toJson: () => ({}) },
      } as unknown as import('pubky-app-specs').FollowResult);

      vi.spyOn(Core.UserApplication, 'follow').mockRejectedValue(new Error('delegate-fail'));

      await expect(UserController.follow(Core.HomeserverAction.PUT, { follower, followee })).rejects.toThrow(
        'delegate-fail',
      );
    });
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

      const pollSpy = vi.spyOn(Core.UserApplication, 'pollNotifications').mockResolvedValue(unread);

      await UserController.notifications({ userId });

      expect(selectLastRead).toHaveBeenCalled();
      expect(pollSpy).toHaveBeenCalledWith({ userId, lastRead });
      expect(setUnread).toHaveBeenCalledWith(unread);
    });

    it('should bubble when pollNotifications fails and not set unread', async () => {
      const userId = 'pubky-user' as unknown as Core.Pubky;
      const lastRead = 1234;

      const selectLastRead = vi.fn(() => lastRead);
      const setUnread = vi.fn();
      vi.spyOn(Core.useNotificationStore, 'getState').mockReturnValue({
        selectLastRead,
        setUnread,
      } as unknown as import('@/core/stores/notification/notification.types').NotificationStore);

      vi.spyOn(Core.UserApplication, 'pollNotifications').mockRejectedValue(new Error('poll-fail'));

      await expect(UserController.notifications({ userId })).rejects.toThrow('poll-fail');

      expect(selectLastRead).toHaveBeenCalled();
      expect(setUnread).not.toHaveBeenCalled();
    });
  });
});
