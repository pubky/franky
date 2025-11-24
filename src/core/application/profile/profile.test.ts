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

    it('should fetch from Nexus and persist when not found locally', async () => {
      const nexusUserDetails = {
        id: userId,
        name: 'Nexus User',
        bio: 'Nexus bio',
        image: '/avatar.jpg',
        status: 'online',
        links: [{ title: 'Website', url: 'https://example.com' }],
        indexed_at: Date.now(),
      };

      const nexusSpy = vi.spyOn(Core.NexusUserService, 'details').mockResolvedValue(nexusUserDetails);
      const upsertSpy = vi.spyOn(Core.UserDetailsModel, 'upsert');

      const result = await ProfileApplication.read({ userId });

      expect(nexusSpy).toHaveBeenCalledWith({ user_id: userId });
      expect(upsertSpy).toHaveBeenCalledWith(nexusUserDetails);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(userId);
      expect(result!.name).toBe('Nexus User');
    });

    it('should return null when Nexus returns 404 (user not found)', async () => {
      const notFoundError = new Libs.AppError(Libs.NexusErrorType.RESOURCE_NOT_FOUND, 'User not found', 404);

      const nexusSpy = vi.spyOn(Core.NexusUserService, 'details').mockRejectedValue(notFoundError);
      const upsertSpy = vi.spyOn(Core.UserDetailsModel, 'upsert');

      const result = await ProfileApplication.read({ userId });

      expect(nexusSpy).toHaveBeenCalledWith({ user_id: userId });
      expect(result).toBeNull();
      // Should not persist anything when user not found
      expect(upsertSpy).not.toHaveBeenCalled();
    });

    it('should re-throw non-404 errors from Nexus', async () => {
      const networkError = new Error('Network error');
      vi.spyOn(Core.NexusUserService, 'details').mockRejectedValue(networkError);

      await expect(ProfileApplication.read({ userId })).rejects.toThrow('Network error');

      expect(Core.NexusUserService.details).toHaveBeenCalledWith({ user_id: userId });
    });

    it('should re-throw server errors (500) from Nexus', async () => {
      const serverError = new Libs.AppError(Libs.NexusErrorType.NETWORK_ERROR, 'Internal server error', 500);

      vi.spyOn(Core.NexusUserService, 'details').mockRejectedValue(serverError);

      await expect(ProfileApplication.read({ userId })).rejects.toThrow('Internal server error');

      expect(Core.NexusUserService.details).toHaveBeenCalledWith({ user_id: userId });
    });

    it('should return undefined when Nexus returns null/undefined', async () => {
      const nexusSpy = vi.spyOn(Core.NexusUserService, 'details').mockResolvedValue(undefined);
      const upsertSpy = vi.spyOn(Core.UserDetailsModel, 'upsert');

      const result = await ProfileApplication.read({ userId });

      expect(nexusSpy).toHaveBeenCalledWith({ user_id: userId });
      expect(result).toBeUndefined();
      // Should not persist when Nexus returns null
      expect(upsertSpy).not.toHaveBeenCalled();
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
});
