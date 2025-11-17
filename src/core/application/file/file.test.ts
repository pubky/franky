import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BlobResult, FileResult } from 'pubky-app-specs';

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

let FileApplication: typeof import('./file').FileApplication;
let Core: typeof import('@/core');

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();

  Core = await import('@/core');
  ({ FileApplication } = await import('./file'));
});

describe('FileApplication', () => {
  describe('upload', () => {
    it('uploads blob and then file record to homeserver', async () => {
      const blobResult = {
        blob: { data: new Uint8Array([1, 2, 3]) },
        meta: { url: 'pubky://user/blob/file' },
      } as unknown as BlobResult;
      const fileJson = { id: 'file-1', kind: 'image' };
      const fileResult = {
        file: { toJson: vi.fn(() => fileJson) },
        meta: { url: 'pubky://user/pub/pubky.app/files/file' },
      } as unknown as FileResult;

      const putBlobSpy = vi.spyOn(Core.HomeserverService, 'putBlob').mockResolvedValue(undefined as unknown as void);
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);

      await FileApplication.upload({ blobResult, fileResult });

      expect(putBlobSpy).toHaveBeenCalledWith(blobResult.meta.url, blobResult.blob.data);
      expect(fileResult.file.toJson).toHaveBeenCalledTimes(1);
      expect(requestSpy).toHaveBeenNthCalledWith(1, Core.HomeserverAction.PUT, fileResult.meta.url, fileJson);

      // Ensure blob upload happened before file record request
      expect(putBlobSpy.mock.invocationCallOrder[0]).toBeLessThan(requestSpy.mock.invocationCallOrder[0]);
    });

    it('propagates errors if the first upload fails', async () => {
      const blobResult = {
        blob: { data: new Uint8Array([9, 9, 9]) },
        meta: { url: 'pubky://user/blob/file' },
      } as unknown as BlobResult;
      const fileResult = {
        file: { toJson: vi.fn() },
        meta: { url: 'pubky://user/pub/pubky.app/files/file' },
      } as unknown as FileResult;

      const putBlobSpy = vi
        .spyOn(Core.HomeserverService, 'putBlob')
        .mockRejectedValueOnce(new Error('blob upload failed'));
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request');

      await expect(FileApplication.upload({ blobResult, fileResult })).rejects.toThrow('blob upload failed');
      expect(putBlobSpy).toHaveBeenCalledTimes(1);
      expect(requestSpy).not.toHaveBeenCalled();
      expect(fileResult.file.toJson).not.toHaveBeenCalled();
    });
  });
});

