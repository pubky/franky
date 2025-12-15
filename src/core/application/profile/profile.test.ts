import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Pubky } from '@/core';
import type { PubkyAppUser, UserResult } from 'pubky-app-specs';

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
let mockAuthState: { setCurrentUserPubky: ReturnType<typeof vi.fn>; setHasProfile: ReturnType<typeof vi.fn> };
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
    setHasProfile: vi.fn(),
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
  describe('commitSetDetails', () => {
    it('creates profile and sets auth state on success', async () => {
      const profileJson = { name: 'Alice' };
      const profile = { toJson: vi.fn(() => profileJson) } as unknown as PubkyAppUser;
      const url = 'pubky://user/pub/pubky.app/user';
      const pubky = 'test-pubky' as Pubky;

      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await ProfileApplication.commitSetDetails({ profile, url, pubky });

      expect(profile.toJson).toHaveBeenCalledTimes(1);
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, url, profileJson);
      expect(mockAuthState.setCurrentUserPubky).toHaveBeenCalledWith(pubky);
      expect(mockAuthState.setHasProfile).toHaveBeenCalledWith(true);
    });

    it('rethrows on failure without resetting auth state', async () => {
      const profileJson = { name: 'Bob' };
      const profile = { toJson: vi.fn(() => profileJson) } as unknown as PubkyAppUser;
      const url = 'pubky://user/pub/pubky.app/user';
      const pubky = 'test-pubky' as Pubky;

      vi.spyOn(Core.HomeserverService, 'request').mockRejectedValue(new Error('create failed'));

      await expect(ProfileApplication.commitSetDetails({ profile, url, pubky })).rejects.toThrow('create failed');

      // Auth state should not be modified on error (see TODO in profile.ts)
      expect(mockAuthState.setHasProfile).not.toHaveBeenCalled();
      expect(mockAuthState.setCurrentUserPubky).not.toHaveBeenCalled();
    });
  });

  describe('commitUpdateDetailsStatus', () => {
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
      await ProfileApplication.commitUpdateDetailsStatus({ pubky: testPubky, status: 'vacationing' });

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

      await ProfileApplication.commitUpdateDetailsStatus({ pubky: testPubky, status: '' });

      const updatedUser = await Core.UserDetailsModel.findById(testPubky);
      expect(updatedUser!.status).toBeNull();
    });

    it('throws error when user not found', async () => {
      await expect(
        ProfileApplication.commitUpdateDetailsStatus({ pubky: testPubky, status: 'available' }),
      ).rejects.toThrow('User profile not found');
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

      await expect(
        ProfileApplication.commitUpdateDetailsStatus({ pubky: testPubky, status: 'vacationing' }),
      ).rejects.toThrow('Network error');

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

      await ProfileApplication.commitUpdateDetailsStatus({ pubky: testPubky, status: 'busy' });

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
