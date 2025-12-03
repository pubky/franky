import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FollowResult } from 'pubky-app-specs';
import { UserController } from './user';
import * as Core from '@/core';

describe('UserController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDetails', () => {
    it('should delegate to ProfileApplication.read', async () => {
      const userId = 'test-user-id';
      const mockUserDetails = {
        id: userId,
        name: 'Test User',
        bio: 'Test bio',
        image: '',
        links: [],
        status: '',
      } as Core.NexusUserDetails;

      const readSpy = vi.spyOn(Core.ProfileApplication, 'read').mockResolvedValue(mockUserDetails);

      const result = await UserController.getDetails({ userId });

      expect(result).toEqual(mockUserDetails);
      expect(readSpy).toHaveBeenCalledWith({ userId });
    });

    it('should return null when user details not found', async () => {
      const userId = 'non-existent-user';

      vi.spyOn(Core.ProfileApplication, 'read').mockResolvedValue(null);

      const result = await UserController.getDetails({ userId });

      expect(result).toBeNull();
    });

    it('should propagate errors from application layer', async () => {
      const userId = 'test-user-id';

      vi.spyOn(Core.ProfileApplication, 'read').mockRejectedValue(new Error('Database error'));

      await expect(UserController.getDetails({ userId })).rejects.toThrow('Database error');
    });
  });

  describe('bulkGetDetails', () => {
    it('should delegate to ProfileApplication.bulkRead', async () => {
      const userIds = ['user1', 'user2'] as Core.Pubky[];
      const mockMap = new Map<Core.Pubky, Core.NexusUserDetails>([
        ['user1' as Core.Pubky, { id: 'user1', name: 'User 1' } as Core.NexusUserDetails],
        ['user2' as Core.Pubky, { id: 'user2', name: 'User 2' } as Core.NexusUserDetails],
      ]);

      const bulkReadSpy = vi.spyOn(Core.ProfileApplication, 'bulkRead').mockResolvedValue(mockMap);

      const result = await UserController.bulkGetDetails(userIds);

      expect(result).toEqual(mockMap);
      expect(bulkReadSpy).toHaveBeenCalledWith(userIds);
    });

    it('should return empty map for empty array', async () => {
      const bulkReadSpy = vi.spyOn(Core.ProfileApplication, 'bulkRead').mockResolvedValue(new Map());

      const result = await UserController.bulkGetDetails([]);

      expect(result.size).toBe(0);
      expect(bulkReadSpy).toHaveBeenCalledWith([]);
    });
  });

  describe('getCounts', () => {
    it('should delegate to UserApplication.counts', async () => {
      const userId = 'test-user-id';
      const mockUserCounts = {
        id: userId,
        posts: 10,
        replies: 5,
        followers: 20,
        following: 15,
        friends: 8,
        tagged: 3,
        tags: 2,
        unique_tags: 1,
        bookmarks: 7,
      } as Core.NexusUserCounts;

      const countsSpy = vi.spyOn(Core.UserApplication, 'counts').mockResolvedValue(mockUserCounts);

      const result = await UserController.getCounts({ userId });

      expect(result).toEqual(mockUserCounts);
      expect(countsSpy).toHaveBeenCalledWith({ userId });
    });

    it('should return null when user counts not found', async () => {
      const userId = 'non-existent-user';

      vi.spyOn(Core.UserApplication, 'counts').mockResolvedValue(null);

      const result = await UserController.getCounts({ userId });

      expect(result).toBeNull();
    });

    it('should propagate errors from application layer', async () => {
      const userId = 'test-user-id';

      vi.spyOn(Core.UserApplication, 'counts').mockRejectedValue(new Error('Database error'));

      await expect(UserController.getCounts({ userId })).rejects.toThrow('Database error');
    });
  });

  describe('bulkGetCounts', () => {
    it('should delegate to UserApplication.bulkCounts', async () => {
      const userIds = ['user1', 'user2'] as Core.Pubky[];
      const mockMap = new Map<Core.Pubky, Core.NexusUserCounts>([
        ['user1' as Core.Pubky, { id: 'user1', posts: 10, followers: 5 } as Core.NexusUserCounts],
        ['user2' as Core.Pubky, { id: 'user2', posts: 20, followers: 15 } as Core.NexusUserCounts],
      ]);

      const bulkCountsSpy = vi.spyOn(Core.UserApplication, 'bulkCounts').mockResolvedValue(mockMap);

      const result = await UserController.bulkGetCounts(userIds);

      expect(result).toEqual(mockMap);
      expect(bulkCountsSpy).toHaveBeenCalledWith(userIds);
    });

    it('should return empty map for empty array', async () => {
      const bulkCountsSpy = vi.spyOn(Core.UserApplication, 'bulkCounts').mockResolvedValue(new Map());

      const result = await UserController.bulkGetCounts([]);

      expect(result.size).toBe(0);
      expect(bulkCountsSpy).toHaveBeenCalledWith([]);
    });
  });

  describe('follow', () => {
    it('should normalize follow request and delegate to UserApplication.follow (PUT)', async () => {
      const follower = 'pubky-follower' as unknown as Core.Pubky;
      const followee = 'pubky-followee' as unknown as Core.Pubky;

      const mockFollowJson = { foo: 'bar' } as Record<string, unknown>;
      const mockToJson = vi.fn(() => mockFollowJson);
      const mockMeta = { url: 'https://example.com/follow' } as { url: string };

      const toSpy = vi.spyOn(Core.FollowNormalizer, 'to').mockReturnValue({
        meta: mockMeta,
        follow: { toJson: mockToJson },
      } as unknown as FollowResult);

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
        activeStreamId: null, // Returns null in test environment (not on /home route)
      });
    });

    it('should support DELETE action and delegate correctly', async () => {
      const follower = 'pubky-follower' as unknown as Core.Pubky;
      const followee = 'pubky-followee' as unknown as Core.Pubky;

      const mockFollowJson = { baz: 1 } as Record<string, unknown>;
      const mockToJson = vi.fn(() => mockFollowJson);
      const mockMeta = { url: 'https://example.com/unfollow' } as { url: string };

      vi.spyOn(Core.FollowNormalizer, 'to').mockReturnValue({
        meta: mockMeta,
        follow: { toJson: mockToJson },
      } as unknown as FollowResult);

      const followSpy = vi.spyOn(Core.UserApplication, 'follow').mockResolvedValue(undefined);

      await UserController.follow(Core.HomeserverAction.DELETE, { follower, followee });

      expect(followSpy).toHaveBeenCalledWith({
        eventType: Core.HomeserverAction.DELETE,
        followUrl: mockMeta.url,
        followJson: mockFollowJson,
        follower,
        followee,
        activeStreamId: null, // Returns null in test environment (not on /home route)
      });
    });

    it('should bubble when FollowNormalizer.to fails and not delegate', async () => {
      const follower = 'pubky-follower' as unknown as Core.Pubky;
      const followee = 'pubky-followee' as unknown as Core.Pubky;

      vi.spyOn(Core.FollowNormalizer, 'to').mockImplementation(() => {
        throw new Error('normalize-fail');
      });
      const followSpy = vi.spyOn(Core.UserApplication, 'follow').mockResolvedValue(undefined);

      await expect(UserController.follow(Core.HomeserverAction.PUT, { follower, followee })).rejects.toThrow(
        'normalize-fail',
      );

      expect(followSpy).not.toHaveBeenCalled();
    });

    it('should bubble when UserApplication.follow fails', async () => {
      const follower = 'pubky-follower' as unknown as Core.Pubky;
      const followee = 'pubky-followee' as unknown as Core.Pubky;

      vi.spyOn(Core.FollowNormalizer, 'to').mockReturnValue({
        meta: { url: 'https://example.com/follow' },
        follow: { toJson: () => ({}) },
      } as unknown as FollowResult);

      vi.spyOn(Core.UserApplication, 'follow').mockRejectedValue(new Error('delegate-fail'));

      await expect(UserController.follow(Core.HomeserverAction.PUT, { follower, followee })).rejects.toThrow(
        'delegate-fail',
      );
    });
  });

  describe('tags', () => {
    it('should delegate to UserApplication with correct params', async () => {
      const userId = 'pubky-user' as unknown as Core.Pubky;
      const mockTags = [
        { label: 'developer', taggers: [] as Core.Pubky[], taggers_count: 0, relationship: false },
      ] as Core.NexusTag[];

      const tagsSpy = vi.spyOn(Core.UserApplication, 'tags').mockResolvedValue(mockTags);

      const result = await UserController.tags({
        user_id: userId,
        skip_tags: 5,
        limit_tags: 20,
      });

      expect(result).toEqual(mockTags);
      expect(tagsSpy).toHaveBeenCalledWith({
        user_id: userId,
        skip_tags: 5,
        limit_tags: 20,
      });
    });

    it('should propagate errors from application layer', async () => {
      const userId = 'pubky-user' as unknown as Core.Pubky;

      vi.spyOn(Core.UserApplication, 'tags').mockRejectedValue(new Error('Application error'));

      await expect(
        UserController.tags({
          user_id: userId,
          skip_tags: 0,
          limit_tags: 10,
        }),
      ).rejects.toThrow('Application error');
    });
  });

  describe('taggers', () => {
    it('should delegate to UserApplication with correct params', async () => {
      const userId = 'pubky-user' as unknown as Core.Pubky;
      const mockTaggers = [] as Core.NexusUser[];

      const taggersSpy = vi.spyOn(Core.UserApplication, 'taggers').mockResolvedValue(mockTaggers);

      const result = await UserController.taggers({
        user_id: userId,
        label: 'rust & wasm',
        skip: 10,
        limit: 5,
      });

      expect(result).toEqual(mockTaggers);
      expect(taggersSpy).toHaveBeenCalledWith({
        user_id: userId,
        label: 'rust & wasm',
        skip: 10,
        limit: 5,
      });
    });

    it('should propagate errors from application layer', async () => {
      const userId = 'pubky-user' as unknown as Core.Pubky;

      vi.spyOn(Core.UserApplication, 'taggers').mockRejectedValue(new Error('Application error'));

      await expect(
        UserController.taggers({
          user_id: userId,
          label: 'developer',
          skip: 0,
          limit: 10,
        }),
      ).rejects.toThrow('Application error');
    });
  });

  describe('search', () => {
    const mockUserIds: string[] = ['user1', 'user2'];

    it('should delegate to UserApplication.search and return user IDs', async () => {
      const searchSpy = vi.spyOn(Core.UserApplication, 'search').mockResolvedValue(mockUserIds);

      const result = await UserController.search({ prefix: 'test', limit: 10 }, 'name');

      expect(searchSpy).toHaveBeenCalledWith({ prefix: 'test', limit: 10 }, 'name');
      expect(result).toEqual(mockUserIds);
    });

    it('should search by id when type is id', async () => {
      const searchSpy = vi.spyOn(Core.UserApplication, 'search').mockResolvedValue(mockUserIds);

      await UserController.search({ prefix: 'qr3x' }, 'id');

      expect(searchSpy).toHaveBeenCalledWith({ prefix: 'qr3x' }, 'id');
    });

    it('should return empty array when no users found', async () => {
      vi.spyOn(Core.UserApplication, 'search').mockResolvedValue([]);

      const result = await UserController.search({ prefix: 'nonexistent' }, 'name');

      expect(result).toEqual([]);
    });

    it('should propagate errors from application layer', async () => {
      vi.spyOn(Core.UserApplication, 'search').mockRejectedValue(new Error('Application error'));

      await expect(UserController.search({ prefix: 'test' }, 'name')).rejects.toThrow('Application error');
    });
  });
});
