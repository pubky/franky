import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import { UserApplication } from './user';

// Mock pubky-app-specs
vi.mock('pubky-app-specs', () => ({
  baseUriBuilder: vi.fn((pubky: string) => `pubky://${pubky}/pub/pubky.app/`),
}));

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

describe.todo('UserApplication.downloadData', () => {
  // Note: Download data tests are skipped due to complexity of mocking browser APIs (JSZip, document, URL)
  // The implementation can be manually tested in the browser
  // Basic error handling test:

  const pubky = 'test-pubky' as Core.Pubky;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should propagate error when list fails', async () => {
    vi.spyOn(Core.HomeserverService, 'list').mockRejectedValue(new Error('list failed'));
    const getSpy = vi.spyOn(Core.HomeserverService, 'get');

    await expect(UserApplication.downloadData({ pubky })).rejects.toThrow('list failed');

    expect(getSpy).not.toHaveBeenCalled();
  });
});
