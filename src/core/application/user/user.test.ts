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
