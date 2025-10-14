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
            },
            counts: {
              followers: 10,
              following: 5,
              posts: 20,
            },
            relationship: {
              following: false,
              followed_by: false,
              muted: false,
              blocking: false,
              blocked_by: false,
            },
            tags: {
              tags: [],
            },
          },
        ],
        posts: [
          {
            details: {
              id: 'post-1',
              content: 'Test post content',
              kind: 'Short',
              attachments: [],
              embed: null,
              indexed_at: Date.now(),
            },
            author: 'user-1',
            counts: {
              replies: 0,
              reposts: 0,
              tags: 0,
            },
            relationship: {
              reposted: false,
              replied: false,
              tagged: [],
            },
            tags: {
              tags: [],
            },
          },
        ],
        list: {
          stream: ['post-1'],
          influencers: ['user-1'],
          recommended: ['user-2'],
          hot_tags: ['technology', 'ai'],
        },
      };

      const nexusReadSpy = vi.spyOn(Core.NexusBootstrapService, 'read').mockResolvedValue(mockBootstrapData);
      const persistBootstrapSpy = vi
        .spyOn(Core.LocalPersistenceService, 'persistBootstrap')
        .mockResolvedValue(undefined);

      await BootstrapApplication.read(TEST_PUBKY);

      expect(nexusReadSpy).toHaveBeenCalledWith(TEST_PUBKY);
      expect(persistBootstrapSpy).toHaveBeenCalledWith(mockBootstrapData);

      nexusReadSpy.mockRestore();
      persistBootstrapSpy.mockRestore();
    });

    it('should throw error when NexusBootstrapService fails', async () => {
      const nexusReadSpy = vi.spyOn(Core.NexusBootstrapService, 'read').mockRejectedValue(new Error('Network error'));
      const persistBootstrapSpy = vi.spyOn(Core.LocalPersistenceService, 'persistBootstrap');

      await expect(BootstrapApplication.read(TEST_PUBKY)).rejects.toThrow('Network error');

      expect(nexusReadSpy).toHaveBeenCalledWith(TEST_PUBKY);
      expect(persistBootstrapSpy).not.toHaveBeenCalled();

      nexusReadSpy.mockRestore();
      persistBootstrapSpy.mockRestore();
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

      const nexusReadSpy = vi.spyOn(Core.NexusBootstrapService, 'read').mockResolvedValue(mockBootstrapData);
      const persistBootstrapSpy = vi
        .spyOn(Core.LocalPersistenceService, 'persistBootstrap')
        .mockRejectedValue(new Error('Database error'));

      await expect(BootstrapApplication.read(TEST_PUBKY)).rejects.toThrow('Database error');

      expect(nexusReadSpy).toHaveBeenCalledWith(TEST_PUBKY);
      expect(persistBootstrapSpy).toHaveBeenCalledWith(mockBootstrapData);

      nexusReadSpy.mockRestore();
      persistBootstrapSpy.mockRestore();
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

      const nexusReadSpy = vi.spyOn(Core.NexusBootstrapService, 'read').mockResolvedValue(mockBootstrapData);
      const persistBootstrapSpy = vi
        .spyOn(Core.LocalPersistenceService, 'persistBootstrap')
        .mockResolvedValue(undefined);

      await BootstrapApplication.read(TEST_PUBKY);

      expect(nexusReadSpy).toHaveBeenCalledWith(TEST_PUBKY);
      expect(persistBootstrapSpy).toHaveBeenCalledWith(mockBootstrapData);

      nexusReadSpy.mockRestore();
      persistBootstrapSpy.mockRestore();
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

      const nexusReadSpy = vi.spyOn(Core.NexusBootstrapService, 'read').mockResolvedValue(mockBootstrapData);
      const persistBootstrapSpy = vi
        .spyOn(Core.LocalPersistenceService, 'persistBootstrap')
        .mockResolvedValue(undefined);
      const loggerInfoSpy = vi.spyOn(Libs.Logger, 'info').mockImplementation(() => {});
      const loggerErrorSpy = vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

      const bootstrapPromise = BootstrapApplication.authorizeAndBootstrap(TEST_PUBKY);

      // Fast-forward time for the first 5 second delay
      await vi.advanceTimersByTimeAsync(5000);

      await bootstrapPromise;

      expect(loggerInfoSpy).toHaveBeenCalledWith('Waiting 5 seconds before bootstrap attempt 1...');
      expect(nexusReadSpy).toHaveBeenCalledWith(TEST_PUBKY);
      expect(persistBootstrapSpy).toHaveBeenCalledWith(mockBootstrapData);
      expect(loggerErrorSpy).not.toHaveBeenCalled();

      nexusReadSpy.mockRestore();
      persistBootstrapSpy.mockRestore();
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

      const nexusReadSpy = vi
        .spyOn(Core.NexusBootstrapService, 'read')
        .mockRejectedValueOnce(new Error('Not indexed yet'))
        .mockResolvedValueOnce(mockBootstrapData);
      const persistBootstrapSpy = vi
        .spyOn(Core.LocalPersistenceService, 'persistBootstrap')
        .mockResolvedValue(undefined);
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
      expect(nexusReadSpy).toHaveBeenCalledTimes(2);
      expect(persistBootstrapSpy).toHaveBeenCalledWith(mockBootstrapData);

      nexusReadSpy.mockRestore();
      persistBootstrapSpy.mockRestore();
      loggerInfoSpy.mockRestore();
      loggerErrorSpy.mockRestore();
    });

    it('should retry up to 3 times and throw error if all attempts fail', async () => {
      const nexusReadSpy = vi
        .spyOn(Core.NexusBootstrapService, 'read')
        .mockRejectedValue(new Error('User not indexed'));
      const persistBootstrapSpy = vi.spyOn(Core.LocalPersistenceService, 'persistBootstrap');
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
      expect(nexusReadSpy).toHaveBeenCalledTimes(3);
      expect(persistBootstrapSpy).not.toHaveBeenCalled();

      nexusReadSpy.mockRestore();
      persistBootstrapSpy.mockRestore();
      loggerInfoSpy.mockRestore();
      loggerErrorSpy.mockRestore();
    });

    it('should log retry count on each failure', async () => {
      const nexusReadSpy = vi
        .spyOn(Core.NexusBootstrapService, 'read')
        .mockRejectedValue(new Error('User not indexed'));
      const persistBootstrapSpy = vi.spyOn(Core.LocalPersistenceService, 'persistBootstrap');
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

      nexusReadSpy.mockRestore();
      persistBootstrapSpy.mockRestore();
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

      const nexusReadSpy = vi
        .spyOn(Core.NexusBootstrapService, 'read')
        .mockRejectedValueOnce(new Error('Not indexed yet'))
        .mockRejectedValueOnce(new Error('Still not indexed'))
        .mockResolvedValueOnce(mockBootstrapData);
      const persistBootstrapSpy = vi
        .spyOn(Core.LocalPersistenceService, 'persistBootstrap')
        .mockResolvedValue(undefined);
      const loggerInfoSpy = vi.spyOn(Libs.Logger, 'info').mockImplementation(() => {});
      const loggerErrorSpy = vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});

      const bootstrapPromise = BootstrapApplication.authorizeAndBootstrap(TEST_PUBKY);

      // First attempt
      expect(nexusReadSpy).not.toHaveBeenCalled();
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
      expect(nexusReadSpy).toHaveBeenCalledTimes(3);
      expect(persistBootstrapSpy).toHaveBeenCalledWith(mockBootstrapData);

      nexusReadSpy.mockRestore();
      persistBootstrapSpy.mockRestore();
      loggerInfoSpy.mockRestore();
      loggerErrorSpy.mockRestore();
    });
  });
});
