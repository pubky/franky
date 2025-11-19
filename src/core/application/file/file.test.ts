import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BlobResult, FileResult } from 'pubky-app-specs';
import type { Pubky } from '@/core/models/models.types';
import type { NexusFileDetails } from '@/core/services/nexus/nexus.types';
import { FileVariant } from '@/core/services/nexus/file/file.types';

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

// Mock LocalFileService
vi.mock('@/core/services/local/file', () => ({
  LocalFileService: {
    findByIds: vi.fn(),
    persistFiles: vi.fn(),
    create: vi.fn(),
  },
}));

// Mock NexusFileService
vi.mock('@/core/services/nexus/file', () => ({
  NexusFileService: {
    fetchFiles: vi.fn(),
  },
}));

// Mock @/core to include filesApi
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    filesApi: {
      getAvatarUrl: vi.fn(),
      getImageUrl: vi.fn(),
      getFiles: vi.fn(),
    },
  };
});

let FileApplication: typeof import('./file').FileApplication;
let Core: typeof import('@/core');

const TEST_PUBKY = 'operrr8wsbpr3ue9d4qj41ge1kcc6r7fdiy6o3ugjrrhi4y77rd0' as Pubky;
const TEST_TIMESTAMP = 1234567890;

const createMockFile = (
  id: string,
  name: string,
  uri: string,
  overrides?: Partial<NexusFileDetails>,
): NexusFileDetails => ({
  id,
  name,
  src: `src-${name}`,
  content_type: 'image/jpeg',
  size: 100,
  created_at: TEST_TIMESTAMP,
  indexed_at: TEST_TIMESTAMP,
  metadata: {},
  owner_id: TEST_PUBKY,
  uri,
  urls: { feed: '', main: '', small: '' },
  ...overrides,
});

const createFileUri = (fileId: string, pubky: Pubky = TEST_PUBKY) => `pubky://${pubky}/pub/pubky.app/files/${fileId}`;

const createMockUrls = (feed: string = 'feed', main: string = 'main', small: string = 'small') =>
  JSON.stringify({ feed, main, small });

const createMockBlobResult = (url: string = 'pubky://user/blob/file') =>
  ({
    blob: { data: new Uint8Array([1, 2, 3]) },
    meta: { url },
  }) as unknown as BlobResult;

const createMockFileResult = (
  url: string = 'pubky://user/pub/pubky.app/files/file',
  fileJson: Record<string, unknown> = { id: 'file-1', kind: 'image' },
) =>
  ({
    file: { toJson: vi.fn(() => fileJson) },
    meta: { url },
  }) as unknown as FileResult;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();

  Core = await import('@/core');
  ({ FileApplication } = await import('./file'));
});

describe('FileApplication', () => {
  describe('upload', () => {
    it('uploads blob and then file record to homeserver', async () => {
      const fileJson = { id: 'file-1', kind: 'image' };
      const blobResult = createMockBlobResult();
      const fileResult = createMockFileResult(undefined, fileJson);

      const putBlobSpy = vi.spyOn(Core.HomeserverService, 'putBlob').mockResolvedValue(undefined as unknown as void);
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined as unknown as void);
      const createSpy = vi.spyOn(Core.LocalFileService, 'create').mockResolvedValue(undefined);

      await FileApplication.upload({ blobResult, fileResult });

      expect(putBlobSpy).toHaveBeenCalledWith(blobResult.meta.url, blobResult.blob.data);
      expect(fileResult.file.toJson).toHaveBeenCalledTimes(1);
      expect(requestSpy).toHaveBeenNthCalledWith(1, Core.HomeserverAction.PUT, fileResult.meta.url, fileJson);
      expect(createSpy).toHaveBeenCalledWith({ blobResult, fileResult });

      // Ensure blob upload happened before file record request
      expect(putBlobSpy.mock.invocationCallOrder[0]).toBeLessThan(requestSpy.mock.invocationCallOrder[0]);
      // Ensure file record request happened before local persistence
      expect(requestSpy.mock.invocationCallOrder[0]).toBeLessThan(createSpy.mock.invocationCallOrder[0]);
    });

    it('propagates errors if the first upload fails', async () => {
      const blobResult = createMockBlobResult();
      const fileResult = createMockFileResult();

      const putBlobSpy = vi
        .spyOn(Core.HomeserverService, 'putBlob')
        .mockRejectedValueOnce(new Error('blob upload failed'));
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request');
      const createSpy = vi.spyOn(Core.LocalFileService, 'create');

      await expect(FileApplication.upload({ blobResult, fileResult })).rejects.toThrow('blob upload failed');
      expect(putBlobSpy).toHaveBeenCalledTimes(1);
      expect(requestSpy).not.toHaveBeenCalled();
      expect(fileResult.file.toJson).not.toHaveBeenCalled();
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('propagates errors if the file record upload fails', async () => {
      const fileJson = { id: 'file-1', kind: 'image' };
      const blobResult = createMockBlobResult();
      const fileResult = createMockFileResult(undefined, fileJson);

      const putBlobSpy = vi.spyOn(Core.HomeserverService, 'putBlob').mockResolvedValue(undefined as unknown as void);
      const requestSpy = vi
        .spyOn(Core.HomeserverService, 'request')
        .mockRejectedValueOnce(new Error('file record upload failed'));
      const createSpy = vi.spyOn(Core.LocalFileService, 'create');

      await expect(FileApplication.upload({ blobResult, fileResult })).rejects.toThrow('file record upload failed');
      expect(putBlobSpy).toHaveBeenCalledTimes(1);
      expect(fileResult.file.toJson).toHaveBeenCalledTimes(1);
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('getMetadata', () => {
    it('returns files for valid file attachment URIs', async () => {
      const fileId1 = 'file-123';
      const fileId2 = 'file-456';
      const uri1 = createFileUri(fileId1);
      const uri2 = createFileUri(fileId2);
      const compositeId1 = Core.buildCompositeId({ pubky: TEST_PUBKY, id: fileId1 });
      const compositeId2 = Core.buildCompositeId({ pubky: TEST_PUBKY, id: fileId2 });

      const mockFiles = [
        createMockFile(compositeId1, 'file1.jpg', uri1),
        createMockFile(compositeId2, 'file2.png', uri2, { content_type: 'image/png', size: 200 }),
      ];

      vi.spyOn(Core.LocalFileService, 'findByIds').mockResolvedValue(mockFiles);

      const result = await FileApplication.getMetadata({ fileAttachments: [uri1, uri2] });

      expect(Core.LocalFileService.findByIds).toHaveBeenCalledWith([compositeId1, compositeId2]);
      expect(result).toEqual(mockFiles);
    });

    it('filters out invalid URIs and only queries valid ones', async () => {
      const fileId = 'file-123';
      const validUri = createFileUri(fileId);
      const invalidUri = 'not-a-valid-uri';
      const compositeId = Core.buildCompositeId({ pubky: TEST_PUBKY, id: fileId });

      const mockFiles = [createMockFile(compositeId, 'file1.jpg', validUri)];

      vi.spyOn(Core.LocalFileService, 'findByIds').mockResolvedValue(mockFiles);

      const result = await FileApplication.getMetadata({ fileAttachments: [validUri, invalidUri] });

      expect(Core.LocalFileService.findByIds).toHaveBeenCalledWith([compositeId]);
      expect(result).toEqual(mockFiles);
    });

    it('returns empty array when no valid URIs are provided', async () => {
      vi.spyOn(Core.LocalFileService, 'findByIds').mockResolvedValue([]);

      const result = await FileApplication.getMetadata({ fileAttachments: ['invalid-uri-1', 'invalid-uri-2'] });

      expect(Core.LocalFileService.findByIds).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });

    it('returns empty array when fileAttachments is empty', async () => {
      vi.spyOn(Core.LocalFileService, 'findByIds').mockResolvedValue([]);

      const result = await FileApplication.getMetadata({ fileAttachments: [] });

      expect(Core.LocalFileService.findByIds).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });

    it('propagates errors from LocalFileService', async () => {
      const fileId = 'file-123';
      const uri = createFileUri(fileId);
      const compositeId = Core.buildCompositeId({ pubky: TEST_PUBKY, id: fileId });

      const error = new Error('Database query failed');
      vi.spyOn(Core.LocalFileService, 'findByIds').mockRejectedValue(error);

      await expect(FileApplication.getMetadata({ fileAttachments: [uri] })).rejects.toThrow('Database query failed');
      expect(Core.LocalFileService.findByIds).toHaveBeenCalledWith([compositeId]);
    });
  });

  describe('getAvatarUrl', () => {
    it('delegates to filesApi.getAvatarUrl', () => {
      const expectedUrl = 'https://cdn.example.com/avatar/encoded-pubky';

      vi.spyOn(Core.filesApi, 'getAvatarUrl').mockReturnValue(expectedUrl);

      const result = FileApplication.getAvatarUrl(TEST_PUBKY);

      expect(Core.filesApi.getAvatarUrl).toHaveBeenCalledWith(TEST_PUBKY);
      expect(result).toBe(expectedUrl);
    });
  });

  describe('getImageUrl', () => {
    it('parses composite ID and delegates to filesApi.getImageUrl', () => {
      const fileId = 'file-123';
      const compositeId = Core.buildCompositeId({ pubky: TEST_PUBKY, id: fileId });
      const variant = FileVariant.SMALL;
      const expectedUrl = 'https://cdn.example.com/files/encoded-pubky/encoded-file-id/small';

      const parseCompositeIdSpy = vi.spyOn(Core, 'parseCompositeId').mockReturnValue({ pubky: TEST_PUBKY, id: fileId });
      vi.spyOn(Core.filesApi, 'getImageUrl').mockReturnValue(expectedUrl);

      const result = FileApplication.getImageUrl({ fileId: compositeId, variant });

      expect(parseCompositeIdSpy).toHaveBeenCalledWith(compositeId);
      expect(Core.filesApi.getImageUrl).toHaveBeenCalledWith({ pubky: TEST_PUBKY, file_id: fileId, variant });
      expect(result).toBe(expectedUrl);
    });

    it('propagates errors from parseCompositeId', () => {
      const invalidCompositeId = 'invalid-id';
      const variant = FileVariant.FEED;

      vi.spyOn(Core, 'parseCompositeId').mockImplementation(() => {
        throw new Error(`Invalid composite id: ${invalidCompositeId}`);
      });

      expect(() => FileApplication.getImageUrl({ fileId: invalidCompositeId, variant })).toThrow(
        `Invalid composite id: ${invalidCompositeId}`,
      );
      expect(Core.filesApi.getImageUrl).not.toHaveBeenCalled();
    });
  });

  describe('persistFiles', () => {
    it('returns early when fileUris is empty', async () => {
      const persistFilesSpy = vi.spyOn(Core.LocalFileService, 'persistFiles');
      const fetchFilesSpy = vi.spyOn(Core.NexusFileService, 'fetchFiles');

      await FileApplication.persistFiles([]);

      expect(fetchFilesSpy).not.toHaveBeenCalled();
      expect(persistFilesSpy).not.toHaveBeenCalled();
    });

    it('fetches files from nexus and persists them with composite IDs', async () => {
      const fileId1 = 'file-123';
      const fileId2 = 'file-456';
      const uri1 = createFileUri(fileId1);
      const uri2 = createFileUri(fileId2);
      const compositeId1 = Core.buildCompositeIdFromPubkyUri({ uri: uri1, domain: Core.CompositeIdDomain.FILES });
      const compositeId2 = Core.buildCompositeIdFromPubkyUri({ uri: uri2, domain: Core.CompositeIdDomain.FILES });

      const nexusFiles = [
        {
          ...createMockFile('', 'file1.jpg', uri1),
          urls: createMockUrls('feed1', 'main1', 'small1'),
        },
        {
          ...createMockFile('', 'file2.png', uri2, { content_type: 'image/png', size: 200 }),
          urls: createMockUrls('feed2', 'main2', 'small2'),
        },
      ];

      const expectedFilesWithIds = [
        { ...nexusFiles[0], id: compositeId1, urls: { feed: 'feed1', main: 'main1', small: 'small1' } },
        { ...nexusFiles[1], id: compositeId2, urls: { feed: 'feed2', main: 'main2', small: 'small2' } },
      ];

      vi.spyOn(Core.NexusFileService, 'fetchFiles').mockResolvedValue(nexusFiles as unknown as NexusFileDetails[]);
      const persistFilesSpy = vi.spyOn(Core.LocalFileService, 'persistFiles').mockResolvedValue(undefined);

      await FileApplication.persistFiles([uri1, uri2]);

      expect(Core.NexusFileService.fetchFiles).toHaveBeenCalledWith([uri1, uri2]);
      expect(persistFilesSpy).toHaveBeenCalledWith({ files: expectedFilesWithIds });
    });

    it('filters out files with invalid URIs when building composite IDs', async () => {
      const fileId = 'file-123';
      const validUri = createFileUri(fileId);
      const invalidUri = 'not-a-valid-uri';
      const compositeId = Core.buildCompositeIdFromPubkyUri({ uri: validUri, domain: Core.CompositeIdDomain.FILES });

      const nexusFiles = [
        {
          ...createMockFile('', 'file1.jpg', validUri),
          urls: createMockUrls('feed1', 'main1', 'small1'),
        },
        {
          ...createMockFile('', 'file2.png', invalidUri, { content_type: 'image/png', size: 200 }),
          urls: createMockUrls('feed2', 'main2', 'small2'),
        },
      ];

      const expectedFilesWithIds = [
        { ...nexusFiles[0], id: compositeId, urls: { feed: 'feed1', main: 'main1', small: 'small1' } },
        { ...nexusFiles[1], id: null as unknown as string, urls: { feed: 'feed2', main: 'main2', small: 'small2' } }, // buildCompositeIdFromPubkyUri returns null for invalid URI
      ];

      vi.spyOn(Core.NexusFileService, 'fetchFiles').mockResolvedValue(nexusFiles as unknown as NexusFileDetails[]);
      const persistFilesSpy = vi.spyOn(Core.LocalFileService, 'persistFiles').mockResolvedValue(undefined);

      await FileApplication.persistFiles([validUri, invalidUri]);

      expect(persistFilesSpy).toHaveBeenCalledWith({ files: expectedFilesWithIds });
    });

    it('handles empty response from NexusFileService', async () => {
      const uri = 'pubky://user/pub/pubky.app/files/file-123';

      vi.spyOn(Core.NexusFileService, 'fetchFiles').mockResolvedValue([]);
      const persistFilesSpy = vi.spyOn(Core.LocalFileService, 'persistFiles').mockResolvedValue(undefined);

      await FileApplication.persistFiles([uri]);

      expect(Core.NexusFileService.fetchFiles).toHaveBeenCalledWith([uri]);
      expect(persistFilesSpy).toHaveBeenCalledWith({ files: [] });
    });

    it('propagates errors from NexusFileService', async () => {
      const uri = 'pubky://user/pub/pubky.app/files/file-123';
      const error = new Error('Network error');

      vi.spyOn(Core.NexusFileService, 'fetchFiles').mockRejectedValue(error);
      const persistFilesSpy = vi.spyOn(Core.LocalFileService, 'persistFiles');

      await expect(FileApplication.persistFiles([uri])).rejects.toThrow('Network error');
      expect(persistFilesSpy).not.toHaveBeenCalled();
    });

    it('propagates errors from LocalFileService.persistFiles', async () => {
      const fileId = 'file-123';
      const uri = createFileUri(fileId);
      const compositeId = Core.buildCompositeIdFromPubkyUri({ uri, domain: Core.CompositeIdDomain.FILES });

      const nexusFiles = [
        {
          ...createMockFile('', 'file1.jpg', uri),
          urls: createMockUrls('feed1', 'main1', 'small1'),
        },
      ];
      const expectedFilesWithIds = [
        { ...nexusFiles[0], id: compositeId, urls: { feed: 'feed1', main: 'main1', small: 'small1' } },
      ];

      vi.spyOn(Core.NexusFileService, 'fetchFiles').mockResolvedValue(nexusFiles as unknown as NexusFileDetails[]);
      const error = new Error('Database save failed');
      vi.spyOn(Core.LocalFileService, 'persistFiles').mockRejectedValue(error);

      await expect(FileApplication.persistFiles([uri])).rejects.toThrow('Database save failed');
      expect(Core.LocalFileService.persistFiles).toHaveBeenCalledWith({ files: expectedFilesWithIds });
    });
  });
});
