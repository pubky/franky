import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BootstrapApplication } from './bootstrap';
import * as Core from '@/core';
import * as Libs from '@/libs';

// Mock pubky-app-specs to avoid WebAssembly issues
vi.mock('pubky-app-specs', () => ({
  default: vi.fn(() => Promise.resolve()),
}));

describe('BootstrapApplication', () => {
  const TEST_PUBKY = 'test-pubky-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('read', () => {
    it('should successfully fetch and persist bootstrap data', async () => {
      const mockBootstrapData: Core.NexusBootstrapResponse = {
        users: [
          {
            details: {
              id: 'user-1',
              name: 'Test User',
              bio: 'Test bio',
              image: null,
              links: null,
              status: null,
              indexed_at: Date.now(),
            },
            counts: {
              followers: 10,
              following: 5,
              posts: 20,
              tagged: 0,
              tags: 0,
              unique_tags: 0,
              replies: 0,
              friends: 0,
              bookmarks: 0,
            },
            relationship: {
              following: false,
              followed_by: false,
              muted: false,
            },
            tags: [],
          },
        ],
        posts: [
          {
            details: {
              id: 'post-1',
              content: 'Test post content',
              kind: 'short',
              attachments: [],
              uri: 'pubky://user-1/pub/pubky.app/posts/post-1',
              indexed_at: Date.now(),
              author: 'user-1',
            },
            counts: {
              replies: 0,
              reposts: 0,
              tags: 0,
              unique_tags: 0,
            },
            relationships: {
              reposted: null,
              replied: null,
              mentioned: [],
            },
            tags: [],
          },
        ],
        list: {
          stream: ['post-1'],
          influencers: ['user-1'],
          recommended: ['user-2'],
          hot_tags: [
            {
              label: 'technology',
              taggers_id: ['user-1'],
              tagged_count: 1,
              taggers_count: 1,
            },
          ],
        },
      };

      const nexusFetchSpy = vi.spyOn(Core.NexusBootstrapService, 'fetch').mockResolvedValue(mockBootstrapData);
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue(undefined);
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue(undefined);
      const upsertPostsStreamSpy = vi.spyOn(Core.LocalStreamPostsService, 'upsert').mockResolvedValue(undefined);
      const upsertInfluencersStreamSpy = vi.spyOn(Core.LocalStreamUsersService, 'upsert').mockResolvedValue(undefined);
      const upsertTagsStreamSpy = vi.spyOn(Core.LocalStreamTagsService, 'upsert').mockResolvedValue(undefined);

      await BootstrapApplication.read(TEST_PUBKY);

      expect(nexusFetchSpy).toHaveBeenCalledWith(TEST_PUBKY);
      expect(persistUsersSpy).toHaveBeenCalledWith(mockBootstrapData.users);
      expect(persistPostsSpy).toHaveBeenCalledWith(mockBootstrapData.posts);
      expect(upsertPostsStreamSpy).toHaveBeenCalledWith(
        Core.PostStreamTypes.TIMELINE_ALL,
        mockBootstrapData.list.stream,
      );
      expect(upsertInfluencersStreamSpy).toHaveBeenCalledWith(
        Core.UserStreamTypes.TODAY_INFLUENCERS_ALL,
        mockBootstrapData.list.influencers,
      );
      expect(upsertInfluencersStreamSpy).toHaveBeenCalledWith(
        Core.UserStreamTypes.RECOMMENDED,
        mockBootstrapData.list.recommended,
      );
      expect(upsertTagsStreamSpy).toHaveBeenCalledWith(Core.TagStreamTypes.TODAY_ALL, mockBootstrapData.list.hot_tags);

      nexusFetchSpy.mockRestore();
      persistUsersSpy.mockRestore();
      persistPostsSpy.mockRestore();
      upsertPostsStreamSpy.mockRestore();
      upsertInfluencersStreamSpy.mockRestore();
      upsertTagsStreamSpy.mockRestore();
    });

    it('should throw error when NexusBootstrapService fails', async () => {
      const nexusFetchSpy = vi.spyOn(Core.NexusBootstrapService, 'fetch').mockRejectedValue(new Error('Network error'));
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers');
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts');

      await expect(BootstrapApplication.read(TEST_PUBKY)).rejects.toThrow('Network error');

      expect(nexusFetchSpy).toHaveBeenCalledWith(TEST_PUBKY);
      expect(persistUsersSpy).not.toHaveBeenCalled();
      expect(persistPostsSpy).not.toHaveBeenCalled();

      nexusFetchSpy.mockRestore();
      persistUsersSpy.mockRestore();
      persistPostsSpy.mockRestore();
    });

    it('should throw error when LocalPersistenceService fails', async () => {
      const mockBootstrapData: Core.NexusBootstrapResponse = {
        users: [],
        posts: [],
        list: {
          stream: [],
          influencers: [],
          recommended: [],
          hot_tags: [],
        },
      };

      const nexusFetchSpy = vi.spyOn(Core.NexusBootstrapService, 'fetch').mockResolvedValue(mockBootstrapData);
      const persistUsersSpy = vi
        .spyOn(Core.LocalStreamUsersService, 'persistUsers')
        .mockRejectedValue(new Error('Database error'));

      await expect(BootstrapApplication.read(TEST_PUBKY)).rejects.toThrow('Database error');

      expect(nexusFetchSpy).toHaveBeenCalledWith(TEST_PUBKY);
      expect(persistUsersSpy).toHaveBeenCalledWith(mockBootstrapData.users);

      nexusFetchSpy.mockRestore();
      persistUsersSpy.mockRestore();
    });

    it('should handle empty bootstrap data', async () => {
      const mockBootstrapData: Core.NexusBootstrapResponse = {
        users: [],
        posts: [],
        list: {
          stream: [],
          influencers: [],
          recommended: [],
          hot_tags: [],
        },
      };

      const nexusFetchSpy = vi.spyOn(Core.NexusBootstrapService, 'fetch').mockResolvedValue(mockBootstrapData);
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue(undefined);
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue(undefined);
      const upsertPostsStreamSpy = vi.spyOn(Core.LocalStreamPostsService, 'upsert').mockResolvedValue(undefined);
      const upsertUsersStreamSpy = vi.spyOn(Core.LocalStreamUsersService, 'upsert').mockResolvedValue(undefined);
      const upsertTagsStreamSpy = vi.spyOn(Core.LocalStreamTagsService, 'upsert').mockResolvedValue(undefined);

      await BootstrapApplication.read(TEST_PUBKY);

      expect(nexusFetchSpy).toHaveBeenCalledWith(TEST_PUBKY);
      expect(persistUsersSpy).toHaveBeenCalledWith(mockBootstrapData.users);
      expect(persistPostsSpy).toHaveBeenCalledWith(mockBootstrapData.posts);

      nexusFetchSpy.mockRestore();
      persistUsersSpy.mockRestore();
      persistPostsSpy.mockRestore();
      upsertPostsStreamSpy.mockRestore();
      upsertUsersStreamSpy.mockRestore();
      upsertTagsStreamSpy.mockRestore();
    });
  });

  describe('authorizeAndBootstrap', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should successfully bootstrap on first attempt', async () => {
      const mockBootstrapData: Core.NexusBootstrapResponse = {
        users: [],
        posts: [],
        list: {
          stream: [],
          influencers: [],
          recommended: [],
          hot_tags: [],
        },
      };

      const nexusFetchSpy = vi.spyOn(Core.NexusBootstrapService, 'fetch').mockResolvedValue(mockBootstrapData);
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue(undefined);
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue(undefined);
      const upsertPostsStreamSpy = vi.spyOn(Core.LocalStreamPostsService, 'upsert').mockResolvedValue(undefined);
      const upsertUsersStreamSpy = vi.spyOn(Core.LocalStreamUsersService, 'upsert').mockResolvedValue(undefined);
      const upsertTagsStreamSpy = vi.spyOn(Core.LocalStreamTagsService, 'upsert').mockResolvedValue(undefined);
      const loggerInfoSpy = vi.spyOn(Libs.Logger, 'info').mockImplementation(() => {});
      const loggerErrorSpy = vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

      const bootstrapPromise = BootstrapApplication.authorizeAndBootstrap(TEST_PUBKY);

      // Fast-forward time for the first 5 second delay
      await vi.advanceTimersByTimeAsync(5000);

      await bootstrapPromise;

      expect(loggerInfoSpy).toHaveBeenCalledWith('Waiting 5 seconds before bootstrap attempt 1...');
      expect(nexusFetchSpy).toHaveBeenCalledWith(TEST_PUBKY);
      expect(persistUsersSpy).toHaveBeenCalledWith(mockBootstrapData.users);
      expect(persistPostsSpy).toHaveBeenCalledWith(mockBootstrapData.posts);
      expect(loggerErrorSpy).not.toHaveBeenCalled();

      nexusFetchSpy.mockRestore();
      persistUsersSpy.mockRestore();
      persistPostsSpy.mockRestore();
      upsertPostsStreamSpy.mockRestore();
      upsertUsersStreamSpy.mockRestore();
      upsertTagsStreamSpy.mockRestore();
      loggerInfoSpy.mockRestore();
      loggerErrorSpy.mockRestore();
    });

    it('should retry up to 3 times and succeed on second attempt', async () => {
      const mockBootstrapData: Core.NexusBootstrapResponse = {
        users: [],
        posts: [],
        list: {
          stream: [],
          influencers: [],
          recommended: [],
          hot_tags: [],
        },
      };

      const nexusFetchSpy = vi
        .spyOn(Core.NexusBootstrapService, 'fetch')
        .mockRejectedValueOnce(new Error('Not indexed yet'))
        .mockResolvedValueOnce(mockBootstrapData);
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue(undefined);
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue(undefined);
      const upsertPostsStreamSpy = vi.spyOn(Core.LocalStreamPostsService, 'upsert').mockResolvedValue(undefined);
      const upsertUsersStreamSpy = vi.spyOn(Core.LocalStreamUsersService, 'upsert').mockResolvedValue(undefined);
      const upsertTagsStreamSpy = vi.spyOn(Core.LocalStreamTagsService, 'upsert').mockResolvedValue(undefined);
      const loggerInfoSpy = vi.spyOn(Libs.Logger, 'info').mockImplementation(() => {});
      const loggerErrorSpy = vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

      const bootstrapPromise = BootstrapApplication.authorizeAndBootstrap(TEST_PUBKY);

      // First attempt - wait 5 seconds then fail
      await vi.advanceTimersByTimeAsync(5000);
      await vi.runAllTimersAsync();

      // Second attempt - wait another 5 seconds then succeed
      await vi.advanceTimersByTimeAsync(5000);

      await bootstrapPromise;

      expect(loggerInfoSpy).toHaveBeenCalledWith('Waiting 5 seconds before bootstrap attempt 1...');
      expect(loggerInfoSpy).toHaveBeenCalledWith('Waiting 5 seconds before bootstrap attempt 2...');
      expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to bootstrap', expect.any(Error), 0);
      expect(nexusFetchSpy).toHaveBeenCalledTimes(2);
      expect(persistUsersSpy).toHaveBeenCalledWith(mockBootstrapData.users);
      expect(persistPostsSpy).toHaveBeenCalledWith(mockBootstrapData.posts);

      nexusFetchSpy.mockRestore();
      persistUsersSpy.mockRestore();
      persistPostsSpy.mockRestore();
      upsertPostsStreamSpy.mockRestore();
      upsertUsersStreamSpy.mockRestore();
      upsertTagsStreamSpy.mockRestore();
      loggerInfoSpy.mockRestore();
      loggerErrorSpy.mockRestore();
    });

    it('should retry up to 3 times and throw error if all attempts fail', async () => {
      const nexusFetchSpy = vi
        .spyOn(Core.NexusBootstrapService, 'fetch')
        .mockRejectedValue(new Error('User not indexed'));
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers');
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts');
      const loggerInfoSpy = vi.spyOn(Libs.Logger, 'info').mockImplementation(() => {});
      const loggerErrorSpy = vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

      let error: Error | undefined;

      // Create a wrapper that ensures error is caught synchronously
      const testPromise = (async () => {
        try {
          await BootstrapApplication.authorizeAndBootstrap(TEST_PUBKY);
        } catch (e) {
          error = e as Error;
        }
      })();

      // Advance timers for all 3 attempts
      await vi.advanceTimersByTimeAsync(15000);

      // Wait for the test promise to complete
      await testPromise;

      expect(error).toBeDefined();
      expect(error?.message).toBe('User still not indexed');
      expect(loggerInfoSpy).toHaveBeenCalledTimes(3);
      expect(loggerErrorSpy).toHaveBeenCalledTimes(3);
      expect(nexusFetchSpy).toHaveBeenCalledTimes(3);
      expect(persistUsersSpy).not.toHaveBeenCalled();
      expect(persistPostsSpy).not.toHaveBeenCalled();

      nexusFetchSpy.mockRestore();
      persistUsersSpy.mockRestore();
      persistPostsSpy.mockRestore();
      loggerInfoSpy.mockRestore();
      loggerErrorSpy.mockRestore();
    });

    it('should log retry count on each failure', async () => {
      const nexusFetchSpy = vi
        .spyOn(Core.NexusBootstrapService, 'fetch')
        .mockRejectedValue(new Error('User not indexed'));
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers');
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts');
      const loggerInfoSpy = vi.spyOn(Libs.Logger, 'info').mockImplementation(() => {});
      const loggerErrorSpy = vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

      let error: Error | undefined;

      // Create a wrapper that ensures error is caught synchronously
      const testPromise = (async () => {
        try {
          await BootstrapApplication.authorizeAndBootstrap(TEST_PUBKY);
        } catch (e) {
          error = e as Error;
        }
      })();

      // Advance timers for all 3 attempts
      await vi.advanceTimersByTimeAsync(15000);

      // Wait for the test promise to complete
      await testPromise;

      expect(error).toBeDefined();
      expect(error?.message).toBe('User still not indexed');
      expect(loggerErrorSpy).toHaveBeenNthCalledWith(1, 'Failed to bootstrap', expect.any(Error), 0);
      expect(loggerErrorSpy).toHaveBeenNthCalledWith(2, 'Failed to bootstrap', expect.any(Error), 1);
      expect(loggerErrorSpy).toHaveBeenNthCalledWith(3, 'Failed to bootstrap', expect.any(Error), 2);

      nexusFetchSpy.mockRestore();
      persistUsersSpy.mockRestore();
      persistPostsSpy.mockRestore();
      loggerInfoSpy.mockRestore();
      loggerErrorSpy.mockRestore();
    });

    it('should wait 5 seconds between each retry attempt', async () => {
      const mockBootstrapData: Core.NexusBootstrapResponse = {
        users: [],
        posts: [],
        list: {
          stream: [],
          influencers: [],
          recommended: [],
          hot_tags: [],
        },
      };

      const nexusFetchSpy = vi
        .spyOn(Core.NexusBootstrapService, 'fetch')
        .mockRejectedValueOnce(new Error('Not indexed yet'))
        .mockRejectedValueOnce(new Error('Still not indexed'))
        .mockResolvedValueOnce(mockBootstrapData);
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue(undefined);
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue(undefined);
      const upsertPostsStreamSpy = vi.spyOn(Core.LocalStreamPostsService, 'upsert').mockResolvedValue(undefined);
      const upsertUsersStreamSpy = vi.spyOn(Core.LocalStreamUsersService, 'upsert').mockResolvedValue(undefined);
      const upsertTagsStreamSpy = vi.spyOn(Core.LocalStreamTagsService, 'upsert').mockResolvedValue(undefined);
      const loggerInfoSpy = vi.spyOn(Libs.Logger, 'info').mockImplementation(() => {});
      const loggerErrorSpy = vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

      const bootstrapPromise = BootstrapApplication.authorizeAndBootstrap(TEST_PUBKY);

      // First attempt
      expect(nexusFetchSpy).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(5000);
      await vi.runAllTimersAsync();

      // Second attempt
      await vi.advanceTimersByTimeAsync(5000);
      await vi.runAllTimersAsync();

      // Third attempt
      await vi.advanceTimersByTimeAsync(5000);

      await bootstrapPromise;

      expect(loggerInfoSpy).toHaveBeenCalledTimes(3);
      expect(loggerInfoSpy).toHaveBeenNthCalledWith(1, 'Waiting 5 seconds before bootstrap attempt 1...');
      expect(loggerInfoSpy).toHaveBeenNthCalledWith(2, 'Waiting 5 seconds before bootstrap attempt 2...');
      expect(loggerInfoSpy).toHaveBeenNthCalledWith(3, 'Waiting 5 seconds before bootstrap attempt 3...');
      expect(nexusFetchSpy).toHaveBeenCalledTimes(3);
      expect(persistUsersSpy).toHaveBeenCalledWith(mockBootstrapData.users);
      expect(persistPostsSpy).toHaveBeenCalledWith(mockBootstrapData.posts);

      nexusFetchSpy.mockRestore();
      persistUsersSpy.mockRestore();
      persistPostsSpy.mockRestore();
      upsertPostsStreamSpy.mockRestore();
      upsertUsersStreamSpy.mockRestore();
      upsertTagsStreamSpy.mockRestore();
      loggerInfoSpy.mockRestore();
      loggerErrorSpy.mockRestore();
    });
  });
});
