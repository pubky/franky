import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Pubky } from '@/core';
import type { BlobResult, FileResult, PubkyAppUser } from 'pubky-app-specs';

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

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();

  mockAuthState = {
    setCurrentUserPubky: vi.fn(),
    setAuthenticated: vi.fn(),
  };

  Core = await import('@/core');
  ({ ProfileApplication } = await import('./profile'));
});

describe('ProfileApplication', () => {
  describe('uploadAvatar', () => {
    it('uploads blob and then file record to homeserver', async () => {
      const blobResult = {
        blob: { data: new Uint8Array([1, 2, 3]) },
        meta: { url: 'pubky://user/blob/avatar' },
      } as unknown as BlobResult;
      const fileJson = { id: 'file-1', kind: 'avatar' };
      const fileResult = {
        file: { toJson: vi.fn(() => fileJson) },
        meta: { url: 'pubky://user/pub/pubky.app/files/avatar' },
      } as unknown as FileResult;

      const putBlobSpy = vi.spyOn(Core.HomeserverService, 'putBlob').mockResolvedValue(undefined as unknown as void);
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await ProfileApplication.uploadAvatar({ blobResult, fileResult });

      expect(putBlobSpy).toHaveBeenCalledWith(blobResult.meta.url, blobResult.blob.data);
      expect(fileResult.file.toJson).toHaveBeenCalledTimes(1);
      expect(requestSpy).toHaveBeenNthCalledWith(1, Core.HomeserverAction.PUT, fileResult.meta.url, fileJson);

      // Ensure blob upload happened before file record request
      expect(putBlobSpy.mock.invocationCallOrder[0]).toBeLessThan(requestSpy.mock.invocationCallOrder[0]);
    });

    it('propagates errors if the first upload fails', async () => {
      const blobResult = {
        blob: { data: new Uint8Array([9, 9, 9]) },
        meta: { url: 'pubky://user/blob/avatar' },
      } as unknown as BlobResult;
      const fileResult = {
        file: { toJson: vi.fn() },
        meta: { url: 'pubky://user/pub/pubky.app/files/avatar' },
      } as unknown as FileResult;

      const putBlobSpy = vi
        .spyOn(Core.HomeserverService, 'putBlob')
        .mockRejectedValueOnce(new Error('blob upload failed'));
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request');

      await expect(ProfileApplication.uploadAvatar({ blobResult, fileResult })).rejects.toThrow('blob upload failed');
      expect(putBlobSpy).toHaveBeenCalledTimes(1);
      expect(requestSpy).not.toHaveBeenCalled();
      expect(fileResult.file.toJson).not.toHaveBeenCalled();
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
