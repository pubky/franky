import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Pubky } from '@/core';

// Mock pubky-app-specs
vi.mock('pubky-app-specs', () => ({
  baseUriBuilder: vi.fn((pubky: string) => `pubky://${pubky}/pub/pubky.app/`),
}));

// Mock HomeserverService methods
vi.mock('@/core/services/homeserver', () => ({
  HomeserverService: {
    list: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
  },
  HomeserverAction: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
  },
}));

// Mock Local services
vi.mock('@/core/services/local', () => ({
  Local: {
    User: {
      deleteAccount: vi.fn(),
    },
    Follow: {
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

let UserApplication: typeof import('./user').UserApplication;
let Core: typeof import('@/core');

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();

  Core = await import('@/core');
  ({ UserApplication } = await import('./user'));
});

describe('UserApplication.follow', () => {
  const follower = 'pubky_follower' as Pubky;
  const followee = 'pubky_followee' as Pubky;
  const followUrl = 'pubky://follower/pub/pubky.app/follow';
  const followJson = { foo: 'bar' } as Record<string, unknown>;

  it('should update local state on PUT and call homeserver', async () => {
    const createSpy = vi.spyOn(Core.Local.Follow, 'create').mockResolvedValue(undefined as unknown as void);
    const deleteSpy = vi.spyOn(Core.Local.Follow, 'delete').mockResolvedValue(undefined as unknown as void);
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
    const createSpy = vi.spyOn(Core.Local.Follow, 'create').mockResolvedValue(undefined as unknown as void);
    const deleteSpy = vi.spyOn(Core.Local.Follow, 'delete').mockResolvedValue(undefined as unknown as void);
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
    const createSpy = vi.spyOn(Core.Local.Follow, 'create').mockResolvedValue(undefined as unknown as void);
    const deleteSpy = vi.spyOn(Core.Local.Follow, 'delete').mockResolvedValue(undefined as unknown as void);
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
    const createSpy = vi.spyOn(Core.Local.Follow, 'create').mockRejectedValue(new Error('local-fail'));
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
    const deleteSpy = vi.spyOn(Core.Local.Follow, 'delete').mockRejectedValue(new Error('local-delete-fail'));
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
    vi.spyOn(Core.Local.Follow, 'create').mockResolvedValue(undefined as unknown as void);
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
  const pubky = 'test-pubky' as Pubky;
  const baseDirectory = `pubky://${pubky}/pub/pubky.app/`;
  const profileUrl = `${baseDirectory}profile.json`;

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

    // Local data should be cleared first
    expect(localDeleteSpy).toHaveBeenCalledTimes(1);

    expect(listSpy).toHaveBeenCalledWith(baseDirectory);
    expect(deleteSpy).toHaveBeenCalledTimes(4);

    // Should delete non-profile files first (in reverse alphanumeric order)
    expect(deleteSpy).toHaveBeenNthCalledWith(1, `${baseDirectory}tags/tag1`);
    expect(deleteSpy).toHaveBeenNthCalledWith(2, `${baseDirectory}posts/abc123`);
    expect(deleteSpy).toHaveBeenNthCalledWith(3, `${baseDirectory}follows/user1`);

    // Profile should be deleted last
    expect(deleteSpy).toHaveBeenNthCalledWith(4, profileUrl);
  });

  it('calls setProgress with correct percentages', async () => {
    const fileList = [`${baseDirectory}file1`, `${baseDirectory}file2`, `${baseDirectory}profile.json`];

    vi.spyOn(Core.Local.User, 'deleteAccount').mockResolvedValue(undefined as unknown as void);
    vi.spyOn(Core.HomeserverService, 'list').mockResolvedValue(fileList);
    vi.spyOn(Core.HomeserverService, 'delete').mockResolvedValue(undefined as unknown as void);

    const setProgress = vi.fn();

    await UserApplication.deleteAccount({ pubky, setProgress });

    // Total files = 2 non-profile + 1 profile = 3
    // After file1: 1/3 = 33%
    expect(setProgress).toHaveBeenNthCalledWith(1, 33);
    // After file2: 2/3 = 67%
    expect(setProgress).toHaveBeenNthCalledWith(2, 67);
    // After profile.json: 100%
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

    // Should delete in reverse alphanumeric order (excluding profile)
    expect(deleteSpy).toHaveBeenNthCalledWith(1, `${baseDirectory}zzz`);
    expect(deleteSpy).toHaveBeenNthCalledWith(2, `${baseDirectory}mmm`);
    expect(deleteSpy).toHaveBeenNthCalledWith(3, `${baseDirectory}aaa`);
    expect(deleteSpy).toHaveBeenNthCalledWith(4, profileUrl);
  });
});
