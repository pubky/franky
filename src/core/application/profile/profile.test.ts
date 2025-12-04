import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Pubky } from '@/core';
import type { PubkyAppUser } from 'pubky-app-specs';

// Avoid pulling WASM-heavy deps from type-only modules
vi.mock('pubky-app-specs', () => ({}));

// Mock HomeserverService methods and provide enum-like HomeserverAction
vi.mock('@/core/services/homeserver', () => ({
  HomeserverService: {
    putBlob: vi.fn(),
    request: vi.fn(),
  },
  HomeserverAction: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
  },
}));

// Mock auth store used by application layer
let mockAuthState: { setCurrentUserPubky: ReturnType<typeof vi.fn>; setAuthenticated: ReturnType<typeof vi.fn> };
vi.mock('@/core/stores', () => ({
  useAuthStore: {
    getState: vi.fn(() => mockAuthState),
  },
}));

let ProfileApplication: typeof import('./profile').ProfileApplication;
let Core: typeof import('@/core');
let Libs: typeof import('@/libs');

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();

  mockAuthState = {
    setCurrentUserPubky: vi.fn(),
    setAuthenticated: vi.fn(),
  };

  // Re-import after resetModules
  Libs = await import('@/libs');
  Core = await import('@/core');
  ({ ProfileApplication } = await import('./profile'));

  // Mock Logger to prevent AppError from logging during tests
  vi.spyOn(Libs.Logger, 'error').mockImplementation(() => {});
  vi.spyOn(Libs.Logger, 'warn').mockImplementation(() => {});
  vi.spyOn(Libs.Logger, 'info').mockImplementation(() => {});
  vi.spyOn(Libs.Logger, 'debug').mockImplementation(() => {});
});

describe('ProfileApplication', () => {
  describe('read', () => {
    const userId = 'test-user-id' as Pubky;

    beforeEach(async () => {
      vi.clearAllMocks();
      await Core.UserDetailsModel.table.clear();
    });

    it('should return user details from local database when found', async () => {
      const mockUserDetails = {
        id: userId,
        name: 'Test User',
        bio: 'Test bio',
        image: null,
        status: 'active',
        links: null,
        indexed_at: Date.now(),
      };
      // Create user in local database
      await Core.UserDetailsModel.create(mockUserDetails);

      const nexusSpy = vi.spyOn(Core.NexusUserService, 'details');

      const result = await ProfileApplication.read({ userId });

      expect(result).not.toBeNull();
      expect(result!.id).toBe(userId);
      expect(result!.name).toBe('Test User');
      // Should not call Nexus API when found locally
      expect(nexusSpy).not.toHaveBeenCalled();
    });

    it('should fetch from Nexus using batch endpoint and persist when not found locally', async () => {
      // Clear batch state
      ProfileApplication._clearBatchState();

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue([
        {
          details: {
            id: userId,
            name: 'Nexus User',
            bio: 'Nexus bio',
            image: '/avatar.jpg',
            status: 'online',
            links: [{ title: 'Website', url: 'https://example.com' }],
            indexed_at: Date.now(),
          },
        },
      ]);

      const persistSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue([]);

      await ProfileApplication.read({ userId });

      // Should use batch endpoint
      expect(queryNexusSpy).toHaveBeenCalledWith(
        expect.stringContaining('/stream/users/by_ids'),
        'POST',
        expect.stringContaining(userId),
      );
      expect(persistSpy).toHaveBeenCalled();
    });

    it('should return null when user not found in batch response', async () => {
      // Clear batch state
      ProfileApplication._clearBatchState();

      // Mock batch endpoint returning empty array (user not found)
      vi.spyOn(Core, 'queryNexus').mockResolvedValue([]);
      vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue([]);

      const result = await ProfileApplication.read({ userId });

      // User not in response means not found
      expect(result).toBeNull();
    });

    it('should handle batch endpoint errors gracefully', async () => {
      // Clear batch state
      ProfileApplication._clearBatchState();

      // Mock batch endpoint failing
      vi.spyOn(Core, 'queryNexus').mockRejectedValue(new Error('Network error'));
      const warnSpy = vi.spyOn(Libs.Logger, 'warn');

      // Should not throw, just log warning and return null
      const result = await ProfileApplication.read({ userId });

      expect(warnSpy).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when batch response is null/undefined', async () => {
      // Clear batch state
      ProfileApplication._clearBatchState();

      vi.spyOn(Core, 'queryNexus').mockResolvedValue(null);
      vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue([]);

      const result = await ProfileApplication.read({ userId });

      expect(result).toBeNull();
    });

    it('should batch concurrent requests for the same user (thundering herd prevention)', async () => {
      // Clear any previous batch state
      ProfileApplication._clearBatchState();

      // Mock the batch endpoint
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue([
        {
          details: {
            id: userId,
            name: 'Dedup User',
            bio: 'Testing deduplication',
            image: null,
            status: 'online',
            links: null,
            indexed_at: Date.now(),
          },
        },
      ]);

      vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue([]);

      // Trigger 10 concurrent requests for the same user
      const concurrentRequests = Array.from({ length: 10 }, () => ProfileApplication.read({ userId }));

      // Wait for all requests to complete
      await Promise.all(concurrentRequests);

      // Nexus batch API should only be called ONCE despite 10 concurrent requests
      expect(queryNexusSpy).toHaveBeenCalledTimes(1);
      // The batch should contain only one unique user ID
      expect(queryNexusSpy).toHaveBeenCalledWith(
        expect.stringContaining('/stream/users/by_ids'),
        'POST',
        expect.stringContaining(userId),
      );
    });

    it('should batch concurrent requests for different users into single call', async () => {
      // Clear any previous batch state
      ProfileApplication._clearBatchState();

      const userId2 = 'test-user-id-2' as Pubky;

      // Mock the batch endpoint
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue([
        {
          details: {
            id: userId,
            name: `User ${userId}`,
            bio: '',
            image: null,
            status: null,
            links: null,
            indexed_at: Date.now(),
          },
        },
        {
          details: {
            id: userId2,
            name: `User ${userId2}`,
            bio: '',
            image: null,
            status: null,
            links: null,
            indexed_at: Date.now(),
          },
        },
      ]);

      vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue([]);

      // Trigger concurrent requests for different users
      await Promise.all([ProfileApplication.read({ userId }), ProfileApplication.read({ userId: userId2 })]);

      // Should batch both users into ONE API call
      expect(queryNexusSpy).toHaveBeenCalledTimes(1);
      // The batch should contain both user IDs
      const callArgs = queryNexusSpy.mock.calls[0][2] as string;
      expect(callArgs).toContain(userId);
      expect(callArgs).toContain(userId2);
    });

    it('should allow new requests after batch completes', async () => {
      // Clear any previous batch state
      ProfileApplication._clearBatchState();

      // Mock the batch endpoint
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue([
        {
          details: {
            id: userId,
            name: 'Sequential User',
            bio: '',
            image: null,
            status: null,
            links: null,
            indexed_at: Date.now(),
          },
        },
      ]);

      vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue([]);

      // First request
      await ProfileApplication.read({ userId });

      // Clear database and batch state to force new fetch
      await Core.UserDetailsModel.table.clear();
      ProfileApplication._clearBatchState();

      // Second request (should make a new batch call)
      await ProfileApplication.read({ userId });

      // Should be called twice since requests were sequential and state was cleared
      expect(queryNexusSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('create', () => {
    it('creates profile and sets auth state on success', async () => {
      const profileJson = { name: 'Alice' };
      const profile = { toJson: vi.fn(() => profileJson) } as unknown as PubkyAppUser;
      const url = 'pubky://user/pub/pubky.app/user';
      const pubky = 'test-pubky' as Pubky;

      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await ProfileApplication.create({ profile, url, pubky });

      expect(profile.toJson).toHaveBeenCalledTimes(1);
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, url, profileJson);
      expect(mockAuthState.setCurrentUserPubky).toHaveBeenCalledWith(pubky);
      expect(mockAuthState.setAuthenticated).toHaveBeenCalledWith(true);
    });

    it('resets auth state and rethrows on failure', async () => {
      const profileJson = { name: 'Bob' };
      const profile = { toJson: vi.fn(() => profileJson) } as unknown as PubkyAppUser;
      const url = 'pubky://user/pub/pubky.app/user';
      const pubky = 'test-pubky' as Pubky;

      vi.spyOn(Core.HomeserverService, 'request').mockRejectedValue(new Error('create failed'));

      await expect(ProfileApplication.create({ profile, url, pubky })).rejects.toThrow('create failed');

      expect(mockAuthState.setAuthenticated).toHaveBeenCalledWith(false);
      expect(mockAuthState.setCurrentUserPubky).toHaveBeenCalledWith(null);
    });
  });

  describe('update', () => {
    const testPubky = 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy' as Pubky;

    beforeEach(async () => {
      await Core.UserDetailsModel.table.clear();
    });

    it('updates status in both homeserver and local database', async () => {
      // Setup: Create existing user in local DB
      const existingUser = {
        id: testPubky,
        name: 'Test User',
        bio: 'Test bio',
        image: 'https://example.com/avatar.jpg',
        status: 'available',
        links: [{ title: 'Website', url: 'https://example.com' }],
        indexed_at: Date.now(),
      };
      await Core.UserDetailsModel.create(existingUser);

      // Mock UserNormalizer
      const mockUserResult = {
        user: {
          toJson: vi.fn(() => ({
            name: 'Test User',
            bio: 'Test bio',
            image: 'https://example.com/avatar.jpg',
            links: [{ title: 'Website', url: 'https://example.com' }],
            status: 'vacationing',
          })),
        },
        meta: { url: `pubky://${testPubky}/pub/pubky.app/profile.json` },
      };
      const normalizerSpy = vi
        .spyOn(Core.UserNormalizer, 'to')
        .mockReturnValue(mockUserResult as unknown as UserResult);

      // Mock HomeserverService
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      // Execute
      await ProfileApplication.update({ pubky: testPubky, status: 'vacationing' });

      // Verify UserNormalizer called with complete profile data
      expect(normalizerSpy).toHaveBeenCalledWith(
        {
          name: 'Test User',
          bio: 'Test bio',
          image: 'https://example.com/avatar.jpg',
          links: [{ title: 'Website', url: 'https://example.com' }],
          status: 'vacationing',
        },
        testPubky,
      );

      // Verify homeserver PUT request
      expect(requestSpy).toHaveBeenCalledWith(
        Core.HomeserverAction.PUT,
        `pubky://${testPubky}/pub/pubky.app/profile.json`,
        mockUserResult.user.toJson(),
      );

      // Verify local database update
      const updatedUser = await Core.UserDetailsModel.findById(testPubky);
      expect(updatedUser).not.toBeNull();
      expect(updatedUser!.status).toBe('vacationing');
    });

    it('handles empty status string', async () => {
      const existingUser = {
        id: testPubky,
        name: 'Test User',
        bio: '',
        image: null,
        status: 'available',
        links: null,
        indexed_at: Date.now(),
      };
      await Core.UserDetailsModel.create(existingUser);

      const mockUserResult = {
        user: { toJson: vi.fn(() => ({ name: 'Test User', bio: '', image: '', links: [], status: '' })) },
        meta: { url: `pubky://${testPubky}/pub/pubky.app/profile.json` },
      };
      vi.spyOn(Core.UserNormalizer, 'to').mockReturnValue(mockUserResult as unknown as UserResult);
      vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await ProfileApplication.update({ pubky: testPubky, status: '' });

      const updatedUser = await Core.UserDetailsModel.findById(testPubky);
      expect(updatedUser!.status).toBeNull();
    });

    it('throws error when user not found', async () => {
      await expect(ProfileApplication.update({ pubky: testPubky, status: 'available' })).rejects.toThrow(
        'User profile not found',
      );
    });

    it('rollback: does not update local DB if homeserver request fails', async () => {
      const existingUser = {
        id: testPubky,
        name: 'Test User',
        bio: 'Test bio',
        image: null,
        status: 'available',
        links: null,
        indexed_at: Date.now(),
      };
      await Core.UserDetailsModel.create(existingUser);

      const mockUserResult = {
        user: { toJson: vi.fn(() => ({ name: 'Test User', status: 'vacationing' })) },
        meta: { url: `pubky://${testPubky}/pub/pubky.app/profile.json` },
      };
      vi.spyOn(Core.UserNormalizer, 'to').mockReturnValue(mockUserResult as unknown as UserResult);
      vi.spyOn(Core.HomeserverService, 'request').mockRejectedValue(new Error('Network error'));

      await expect(ProfileApplication.update({ pubky: testPubky, status: 'vacationing' })).rejects.toThrow(
        'Network error',
      );

      // Verify local DB was NOT updated
      const unchangedUser = await Core.UserDetailsModel.findById(testPubky);
      expect(unchangedUser!.status).toBe('available'); // Still the old status
    });

    it('handles null links and image correctly', async () => {
      const existingUser = {
        id: testPubky,
        name: 'Minimal User',
        bio: '',
        image: null,
        status: null,
        links: null,
        indexed_at: Date.now(),
      };
      await Core.UserDetailsModel.create(existingUser);

      const mockUserResult = {
        user: { toJson: vi.fn(() => ({ name: 'Minimal User', bio: '', image: '', links: [], status: 'busy' })) },
        meta: { url: `pubky://${testPubky}/pub/pubky.app/profile.json` },
      };
      const normalizerSpy = vi
        .spyOn(Core.UserNormalizer, 'to')
        .mockReturnValue(mockUserResult as unknown as UserResult);
      vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await ProfileApplication.update({ pubky: testPubky, status: 'busy' });

      // Verify normalizer called with empty strings/arrays for null values
      expect(normalizerSpy).toHaveBeenCalledWith(
        {
          name: 'Minimal User',
          bio: '',
          image: '',
          links: [],
          status: 'busy',
        },
        testPubky,
      );
    });
  });
});
