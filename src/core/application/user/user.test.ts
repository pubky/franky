import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import { UserApplication } from './user';

describe('UserApplication.follow', () => {
  const follower = 'pubky_follower' as Core.Pubky;
  const followee = 'pubky_followee' as Core.Pubky;
  const followUrl = 'pubky://follower/pub/pubky.app/follow';
  const followJson = { foo: 'bar' } as Record<string, unknown>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update local state on PUT and call homeserver', async () => {
    const createSpy = vi.spyOn(Core.LocalFollowService, 'create').mockResolvedValue(undefined as unknown as void);
    const deleteSpy = vi.spyOn(Core.LocalFollowService, 'delete').mockResolvedValue(undefined as unknown as void);
    const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

    await UserApplication.follow({
      eventType: Core.HomeserverAction.PUT,
      followUrl,
      followJson,
      follower,
      followee,
    });

    expect(createSpy).toHaveBeenCalledWith({ follower, followee });
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, followUrl, followJson);
  });

  it('should update local state on DELETE and call homeserver', async () => {
    const createSpy = vi.spyOn(Core.LocalFollowService, 'create').mockResolvedValue(undefined as unknown as void);
    const deleteSpy = vi.spyOn(Core.LocalFollowService, 'delete').mockResolvedValue(undefined as unknown as void);
    const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

    await UserApplication.follow({
      eventType: Core.HomeserverAction.DELETE,
      followUrl,
      followJson,
      follower,
      followee,
    });

    expect(deleteSpy).toHaveBeenCalledWith({ follower, followee });
    expect(createSpy).not.toHaveBeenCalled();
    expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.DELETE, followUrl, followJson);
  });

  it('should not update local state for non-mutate methods but still call homeserver', async () => {
    const createSpy = vi.spyOn(Core.LocalFollowService, 'create').mockResolvedValue(undefined as unknown as void);
    const deleteSpy = vi.spyOn(Core.LocalFollowService, 'delete').mockResolvedValue(undefined as unknown as void);
    const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

    await UserApplication.follow({
      eventType: Core.HomeserverAction.GET,
      followUrl,
      followJson,
      follower,
      followee,
    });

    expect(createSpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.GET, followUrl, followJson);
  });

  it('should propagate error when local create fails on PUT and not call homeserver', async () => {
    const createSpy = vi.spyOn(Core.LocalFollowService, 'create').mockRejectedValue(new Error('local-fail'));
    const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

    await expect(
      UserApplication.follow({
        eventType: Core.HomeserverAction.PUT,
        followUrl,
        followJson,
        follower,
        followee,
      }),
    ).rejects.toThrow('local-fail');

    expect(createSpy).toHaveBeenCalledOnce();
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('should propagate error when local delete fails on DELETE and not call homeserver', async () => {
    const deleteSpy = vi.spyOn(Core.LocalFollowService, 'delete').mockRejectedValue(new Error('local-delete-fail'));
    const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

    await expect(
      UserApplication.follow({
        eventType: Core.HomeserverAction.DELETE,
        followUrl,
        followJson,
        follower,
        followee,
      }),
    ).rejects.toThrow('local-delete-fail');

    expect(deleteSpy).toHaveBeenCalledOnce();
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('should propagate error when homeserver request fails', async () => {
    vi.spyOn(Core.LocalFollowService, 'create').mockResolvedValue(undefined as unknown as void);
    const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockRejectedValue(new Error('homeserver-fail'));

    await expect(
      UserApplication.follow({
        eventType: Core.HomeserverAction.PUT,
        followUrl,
        followJson,
        follower,
        followee,
      }),
    ).rejects.toThrow('homeserver-fail');

    expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, followUrl, followJson);
  });
});

describe('UserApplication.deleteAccount', () => {
  const pubky = 'test-pubky' as Core.Pubky;
  const baseDirectory = `pubky://${pubky}/pub/pubky.app/`;
  const profileUrl = `${baseDirectory}profile.json`;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes all files including profile.json', async () => {
    const fileList = [
      `${baseDirectory}posts/abc123`,
      `${baseDirectory}follows/user1`,
      `${baseDirectory}profile.json`,
      `${baseDirectory}tags/tag1`,
    ];

    const localDeleteSpy = vi.spyOn(Core.Local.User, 'deleteAccount').mockResolvedValue(undefined as unknown as void);
    const listSpy = vi.spyOn(Core.HomeserverService, 'list').mockResolvedValue(fileList);
    const deleteSpy = vi.spyOn(Core.HomeserverService, 'delete').mockResolvedValue(undefined as unknown as void);

    await UserApplication.deleteAccount({ pubky });

    expect(localDeleteSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(baseDirectory);
    expect(deleteSpy).toHaveBeenCalledTimes(4);

    expect(deleteSpy).toHaveBeenNthCalledWith(1, `${baseDirectory}tags/tag1`);
    expect(deleteSpy).toHaveBeenNthCalledWith(2, `${baseDirectory}posts/abc123`);
    expect(deleteSpy).toHaveBeenNthCalledWith(3, `${baseDirectory}follows/user1`);
    expect(deleteSpy).toHaveBeenNthCalledWith(4, profileUrl);
  });

  it('calls setProgress with correct percentages', async () => {
    const fileList = [`${baseDirectory}file1`, `${baseDirectory}file2`, `${baseDirectory}profile.json`];

    vi.spyOn(Core.Local.User, 'deleteAccount').mockResolvedValue(undefined as unknown as void);
    vi.spyOn(Core.HomeserverService, 'list').mockResolvedValue(fileList);
    vi.spyOn(Core.HomeserverService, 'delete').mockResolvedValue(undefined as unknown as void);

    const setProgress = vi.fn();
    await UserApplication.deleteAccount({ pubky, setProgress });

    expect(setProgress).toHaveBeenNthCalledWith(1, 33);
    expect(setProgress).toHaveBeenNthCalledWith(2, 67);
    expect(setProgress).toHaveBeenNthCalledWith(3, 100);
  });

  it('works without setProgress callback', async () => {
    const fileList = [`${baseDirectory}file1`, `${baseDirectory}profile.json`];

    vi.spyOn(Core.Local.User, 'deleteAccount').mockResolvedValue(undefined as unknown as void);
    vi.spyOn(Core.HomeserverService, 'list').mockResolvedValue(fileList);
    const deleteSpy = vi.spyOn(Core.HomeserverService, 'delete').mockResolvedValue(undefined as unknown as void);

    await UserApplication.deleteAccount({ pubky });

    expect(deleteSpy).toHaveBeenCalled();
  });

  it('handles empty file list and only deletes profile.json', async () => {
    const fileList = [`${baseDirectory}profile.json`];

    vi.spyOn(Core.Local.User, 'deleteAccount').mockResolvedValue(undefined as unknown as void);
    const listSpy = vi.spyOn(Core.HomeserverService, 'list').mockResolvedValue(fileList);
    const deleteSpy = vi.spyOn(Core.HomeserverService, 'delete').mockResolvedValue(undefined as unknown as void);

    await UserApplication.deleteAccount({ pubky });

    expect(listSpy).toHaveBeenCalledWith(baseDirectory);
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(profileUrl);
  });

  it('propagates errors when local delete fails', async () => {
    const localDeleteSpy = vi
      .spyOn(Core.Local.User, 'deleteAccount')
      .mockRejectedValue(new Error('local delete failed'));
    const listSpy = vi.spyOn(Core.HomeserverService, 'list');
    const deleteSpy = vi.spyOn(Core.HomeserverService, 'delete');

    await expect(UserApplication.deleteAccount({ pubky })).rejects.toThrow('local delete failed');

    expect(localDeleteSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('propagates errors when list fails', async () => {
    vi.spyOn(Core.Local.User, 'deleteAccount').mockResolvedValue(undefined as unknown as void);
    const listSpy = vi.spyOn(Core.HomeserverService, 'list').mockRejectedValue(new Error('list failed'));
    const deleteSpy = vi.spyOn(Core.HomeserverService, 'delete');

    await expect(UserApplication.deleteAccount({ pubky })).rejects.toThrow('list failed');

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('propagates errors when delete fails', async () => {
    const fileList = [`${baseDirectory}file1`, `${baseDirectory}profile.json`];

    vi.spyOn(Core.Local.User, 'deleteAccount').mockResolvedValue(undefined as unknown as void);
    vi.spyOn(Core.HomeserverService, 'list').mockResolvedValue(fileList);
    const deleteSpy = vi.spyOn(Core.HomeserverService, 'delete').mockRejectedValueOnce(new Error('delete failed'));

    await expect(UserApplication.deleteAccount({ pubky })).rejects.toThrow('delete failed');

    expect(deleteSpy).toHaveBeenCalledTimes(1);
  });

  it('sorts files correctly before deletion', async () => {
    const fileList = [
      `${baseDirectory}aaa`,
      `${baseDirectory}zzz`,
      `${baseDirectory}mmm`,
      `${baseDirectory}profile.json`,
    ];

    vi.spyOn(Core.Local.User, 'deleteAccount').mockResolvedValue(undefined as unknown as void);
    vi.spyOn(Core.HomeserverService, 'list').mockResolvedValue(fileList);
    const deleteSpy = vi.spyOn(Core.HomeserverService, 'delete').mockResolvedValue(undefined as unknown as void);

    await UserApplication.deleteAccount({ pubky });

    expect(deleteSpy).toHaveBeenNthCalledWith(1, `${baseDirectory}zzz`);
    expect(deleteSpy).toHaveBeenNthCalledWith(2, `${baseDirectory}mmm`);
    expect(deleteSpy).toHaveBeenNthCalledWith(3, `${baseDirectory}aaa`);
    expect(deleteSpy).toHaveBeenNthCalledWith(4, profileUrl);
  });
});

describe('UserApplication.pollNotifications', () => {
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

    const unread = await UserApplication.notifications({ userId, lastRead });

    expect(nexusSpy).toHaveBeenCalledWith({ user_id: userId, end: lastRead });
    expect(persistSpy).toHaveBeenCalledWith(notifications, lastRead);
    expect(unread).toBe(1);
  });

  it('should bubble when NexusUserService.notifications fails and not persist', async () => {
    const nexusSpy = vi.spyOn(Core.NexusUserService, 'notifications').mockRejectedValue(new Error('nexus-fail'));
    const persistSpy = vi.spyOn(Core.LocalNotificationService, 'persitAndGetUnreadCount').mockResolvedValue(0);

    await expect(UserApplication.notifications({ userId, lastRead })).rejects.toThrow('nexus-fail');

    expect(nexusSpy).toHaveBeenCalledWith({ user_id: userId, end: lastRead });
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('should bubble when persisting unread count fails', async () => {
    vi.spyOn(Core.NexusUserService, 'notifications').mockResolvedValue([] as unknown as Core.NexusNotification[]);
    const persistSpy = vi
      .spyOn(Core.LocalNotificationService, 'persitAndGetUnreadCount')
      .mockRejectedValue(new Error('persist-fail'));

    await expect(UserApplication.notifications({ userId, lastRead })).rejects.toThrow('persist-fail');

    expect(persistSpy).toHaveBeenCalledOnce();
  });
});
