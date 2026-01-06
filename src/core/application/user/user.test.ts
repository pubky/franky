import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import { UserApplication } from './user';

describe('UserApplication.commitFollow', () => {
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

    await UserApplication.commitFollow({
      eventType: Core.HomeserverAction.PUT,
      followUrl,
      followJson,
      follower,
      followee,
      activeStreamId: undefined,
    });

    expect(createSpy).toHaveBeenCalledWith({ follower, followee, activeStreamId: undefined });
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, followUrl, followJson);
  });

  it('should update local state on DELETE and call homeserver', async () => {
    const createSpy = vi.spyOn(Core.LocalFollowService, 'create').mockResolvedValue(undefined as unknown as void);
    const deleteSpy = vi.spyOn(Core.LocalFollowService, 'delete').mockResolvedValue(undefined as unknown as void);
    const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

    await UserApplication.commitFollow({
      eventType: Core.HomeserverAction.DELETE,
      followUrl,
      followJson,
      follower,
      followee,
      activeStreamId: undefined,
    });

    expect(deleteSpy).toHaveBeenCalledWith({ follower, followee, activeStreamId: undefined });
    expect(createSpy).not.toHaveBeenCalled();
    expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.DELETE, followUrl, followJson);
  });

  it('should not update local state for non-mutate methods but still call homeserver', async () => {
    const createSpy = vi.spyOn(Core.LocalFollowService, 'create').mockResolvedValue(undefined as unknown as void);
    const deleteSpy = vi.spyOn(Core.LocalFollowService, 'delete').mockResolvedValue(undefined as unknown as void);
    const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

    await UserApplication.commitFollow({
      eventType: Core.HomeserverAction.GET,
      followUrl,
      followJson,
      follower,
      followee,
      activeStreamId: undefined,
    });

    expect(createSpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.GET, followUrl, followJson);
  });

  it('should propagate error when local create fails on PUT and not call homeserver', async () => {
    const createSpy = vi.spyOn(Core.LocalFollowService, 'create').mockRejectedValue(new Error('local-fail'));
    const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

    await expect(
      UserApplication.commitFollow({
        eventType: Core.HomeserverAction.PUT,
        followUrl,
        followJson,
        follower,
        followee,
        activeStreamId: undefined,
      }),
    ).rejects.toThrow('local-fail');

    expect(createSpy).toHaveBeenCalledOnce();
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('should propagate error when local delete fails on DELETE and not call homeserver', async () => {
    const deleteSpy = vi.spyOn(Core.LocalFollowService, 'delete').mockRejectedValue(new Error('local-delete-fail'));
    const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

    await expect(
      UserApplication.commitFollow({
        eventType: Core.HomeserverAction.DELETE,
        followUrl,
        followJson,
        follower,
        followee,
        activeStreamId: undefined,
      }),
    ).rejects.toThrow('local-delete-fail');

    expect(deleteSpy).toHaveBeenCalledOnce();
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('should propagate error when homeserver request fails', async () => {
    vi.spyOn(Core.LocalFollowService, 'create').mockResolvedValue(undefined as unknown as void);
    const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockRejectedValue(new Error('homeserver-fail'));

    await expect(
      UserApplication.commitFollow({
        eventType: Core.HomeserverAction.PUT,
        followUrl,
        followJson,
        follower,
        followee,
        activeStreamId: undefined,
      }),
    ).rejects.toThrow('homeserver-fail');

    expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, followUrl, followJson);
  });
});

describe('UserApplication.fetchTags', () => {
  const userId = 'pubky_user' as Core.Pubky;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delegate to NexusUserService with correct params', async () => {
    const mockTags = [
      { label: 'developer', taggers: [] as Core.Pubky[], taggers_count: 0, relationship: false },
    ] as Core.NexusTag[];

    const nexusSpy = vi.spyOn(Core.NexusUserService, 'tags').mockResolvedValue(mockTags);

    const result = await UserApplication.fetchTags({
      user_id: userId,
      skip_tags: 5,
      limit_tags: 20,
    });

    expect(result).toEqual(mockTags);
    expect(nexusSpy).toHaveBeenCalledWith({
      user_id: userId,
      skip_tags: 5,
      limit_tags: 20,
    });
  });

  it('should propagate errors from service layer', async () => {
    vi.spyOn(Core.NexusUserService, 'tags').mockRejectedValue(new Error('Service unavailable'));

    await expect(
      UserApplication.fetchTags({
        user_id: userId,
        skip_tags: 0,
        limit_tags: 10,
      }),
    ).rejects.toThrow('Service unavailable');
  });
});

describe('UserApplication.fetchTaggers', () => {
  const userId = 'pubky_user' as Core.Pubky;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delegate to NexusUserService with correct params', async () => {
    const mockTaggers = [] as Core.NexusTaggers[];
    const nexusSpy = vi.spyOn(Core.NexusUserService, 'taggers').mockResolvedValue(mockTaggers);

    const result = await UserApplication.fetchTaggers({
      user_id: userId,
      label: 'rust & wasm',
      skip: 10,
      limit: 5,
    });

    expect(result).toEqual(mockTaggers);
    expect(nexusSpy).toHaveBeenCalledWith({
      user_id: userId,
      label: 'rust & wasm',
      skip: 10,
      limit: 5,
    });
  });

  it('should propagate errors from service layer', async () => {
    vi.spyOn(Core.NexusUserService, 'taggers').mockRejectedValue(new Error('Network error'));

    await expect(
      UserApplication.fetchTaggers({
        user_id: userId,
        label: 'developer',
        skip: 0,
        limit: 10,
      }),
    ).rejects.toThrow('Network error');
  });
});

describe('UserApplication.getOrFetchDetails', () => {
  const userId = 'pubky_user' as Core.Pubky;
  const mockUserDetails: Core.NexusUserDetails = {
    id: userId,
    name: 'Test User',
    bio: 'Test bio',
    image: 'https://example.com/avatar.jpg',
    indexed_at: 1234567890,
    links: [{ title: 'GitHub', url: 'https://github.com/user' }],
    status: 'online',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user details from local cache when available (local-first)', async () => {
    const localSpy = vi.spyOn(Core.LocalUserService, 'readDetails').mockResolvedValue(mockUserDetails);
    const nexusSpy = vi.spyOn(Core.NexusUserService, 'details').mockResolvedValue(mockUserDetails);
    const upsertSpy = vi.spyOn(Core.LocalProfileService, 'upsertDetails').mockResolvedValue(undefined);

    const result = await UserApplication.getOrFetchDetails({ userId });

    expect(result).toEqual(mockUserDetails);
    expect(localSpy).toHaveBeenCalledWith({ userId });
    expect(nexusSpy).not.toHaveBeenCalled();
    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('should fetch from Nexus and cache locally when not in local cache', async () => {
    const localSpy = vi
      .spyOn(Core.LocalUserService, 'readDetails')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockUserDetails);
    const nexusSpy = vi.spyOn(Core.NexusUserService, 'details').mockResolvedValue(mockUserDetails);
    const upsertSpy = vi.spyOn(Core.LocalProfileService, 'upsertDetails').mockResolvedValue(undefined);

    const result = await UserApplication.getOrFetchDetails({ userId });

    expect(result).toEqual(mockUserDetails);
    expect(localSpy).toHaveBeenCalledTimes(2);
    expect(nexusSpy).toHaveBeenCalledWith({ user_id: userId });
    expect(upsertSpy).toHaveBeenCalledWith(mockUserDetails);
  });

  it('should return null when user not found in local cache or Nexus', async () => {
    const localSpy = vi.spyOn(Core.LocalUserService, 'readDetails').mockResolvedValue(null);
    const nexusSpy = vi
      .spyOn(Core.NexusUserService, 'details')
      .mockResolvedValue(undefined as unknown as Core.NexusUserDetails);
    const upsertSpy = vi.spyOn(Core.LocalProfileService, 'upsertDetails').mockResolvedValue(undefined);

    const result = await UserApplication.getOrFetchDetails({ userId });

    expect(result).toBeNull();
    expect(localSpy).toHaveBeenCalledTimes(2);
    expect(nexusSpy).toHaveBeenCalledWith({ user_id: userId });
    expect(upsertSpy).toHaveBeenCalledWith(undefined);
  });

  it('should propagate errors from local service', async () => {
    vi.spyOn(Core.LocalUserService, 'readDetails').mockRejectedValue(new Error('Local database error'));
    const nexusSpy = vi.spyOn(Core.NexusUserService, 'details').mockResolvedValue(mockUserDetails);

    await expect(UserApplication.getOrFetchDetails({ userId })).rejects.toThrow('Local database error');

    expect(nexusSpy).not.toHaveBeenCalled();
  });

  it('should propagate errors from Nexus service when local cache is empty', async () => {
    vi.spyOn(Core.LocalUserService, 'readDetails').mockResolvedValue(null);
    vi.spyOn(Core.NexusUserService, 'details').mockRejectedValue(new Error('Network error'));
    const upsertSpy = vi.spyOn(Core.LocalProfileService, 'upsertDetails').mockResolvedValue(undefined);

    await expect(UserApplication.getOrFetchDetails({ userId })).rejects.toThrow('Network error');

    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('should propagate errors from upsert when caching Nexus data', async () => {
    vi.spyOn(Core.LocalUserService, 'readDetails').mockResolvedValue(null);
    vi.spyOn(Core.NexusUserService, 'details').mockResolvedValue(mockUserDetails);
    vi.spyOn(Core.LocalProfileService, 'upsertDetails').mockRejectedValue(new Error('Cache write error'));

    await expect(UserApplication.getOrFetchDetails({ userId })).rejects.toThrow('Cache write error');
  });
});

describe('UserApplication.getCounts', () => {
  const userId = 'pubky_user' as Core.Pubky;
  const mockUserCounts: Core.NexusUserCounts = {
    posts: 42,
    replies: 15,
    followers: 100,
    following: 50,
    friends: 25,
    tagged: 10,
    tags: 8,
    unique_tags: 5,
    bookmarks: 30,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user counts from local cache', async () => {
    const localSpy = vi.spyOn(Core.LocalUserService, 'readCounts').mockResolvedValue(mockUserCounts);

    const result = await UserApplication.getCounts({ userId });

    expect(result).toEqual(mockUserCounts);
    expect(localSpy).toHaveBeenCalledWith({ userId });
  });

  it('should fetch from Nexus and cache locally when not in local cache', async () => {
    const localSpy = vi.spyOn(Core.LocalUserService, 'readCounts').mockResolvedValue(null);
    const nexusSpy = vi.spyOn(Core.NexusUserService, 'counts').mockResolvedValue(mockUserCounts);
    const upsertSpy = vi.spyOn(Core.LocalUserService, 'upsertCounts').mockResolvedValue(undefined);

    const result = await UserApplication.getCounts({ userId });

    expect(result).toEqual(mockUserCounts);
    expect(localSpy).toHaveBeenCalledWith({ userId });
    expect(nexusSpy).toHaveBeenCalledWith({ user_id: userId });
    expect(upsertSpy).toHaveBeenCalledWith({ userId }, mockUserCounts);
  });

  it('should propagate errors from local service', async () => {
    vi.spyOn(Core.LocalUserService, 'readCounts').mockRejectedValue(new Error('Local database error'));

    await expect(UserApplication.getCounts({ userId })).rejects.toThrow('Local database error');
  });

  it('should propagate errors from Nexus service when local cache is empty', async () => {
    vi.spyOn(Core.LocalUserService, 'readCounts').mockResolvedValue(null);
    vi.spyOn(Core.NexusUserService, 'counts').mockRejectedValue(new Error('Network error'));
    const upsertSpy = vi.spyOn(Core.LocalUserService, 'upsertCounts').mockResolvedValue(undefined);

    await expect(UserApplication.getCounts({ userId })).rejects.toThrow('Network error');

    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('should propagate errors from upsert when caching Nexus data', async () => {
    vi.spyOn(Core.LocalUserService, 'readCounts').mockResolvedValue(null);
    vi.spyOn(Core.NexusUserService, 'counts').mockResolvedValue(mockUserCounts);
    vi.spyOn(Core.LocalUserService, 'upsertCounts').mockRejectedValue(new Error('Cache write error'));

    await expect(UserApplication.getCounts({ userId })).rejects.toThrow('Cache write error');
  });
});
