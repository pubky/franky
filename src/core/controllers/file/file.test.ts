import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TextEncoder } from 'util';
import type { Pubky } from '@/core/models/models.types';
import { FileVariant } from '@/core/services/nexus/file/file.types';

const mockFileNormalizer = {
  toBlob: vi.fn(),
  toFile: vi.fn(),
};

const mockFileApplication = {
  upload: vi.fn(),
  getAvatarUrl: vi.fn(),
  getImageUrl: vi.fn(),
  getMetadata: vi.fn(),
};

vi.mock('@/core', async () => {
  const actual = await vi.importActual('@/core');
  return {
    ...actual,
    FileNormalizer: mockFileNormalizer,
    FileApplication: mockFileApplication,
  };
});

class MockFile extends File {
  private readonly rawContent: string;

  constructor(content: string[], filename: string, options?: FilePropertyBag) {
    super(content, filename, options);
    this.rawContent = content.join('');
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const view = encoder.encode(this.rawContent);
    return view.buffer.slice(0);
  }
}

const testPubky = 'o4dksfbqk85ogzdb5osziw6befigbuxmuxkuxq8434q89uj56uyy' as Pubky;

let FileController: typeof import('./file').FileController;

// Helper functions
const createMockFile = () => new MockFile(['file content'], 'image.png', { type: 'image/png' });

const createMockBlobResult = () => ({
  blob: { data: new Uint8Array([1, 2, 3]) },
  meta: { url: 'blob-url' },
});

const createMockFileResult = () => ({
  file: { toJson: vi.fn() },
  meta: { url: 'file-url' },
});

const createMockMetadata = () => ({
  id: 'user1:file1',
  name: 'test-file.png',
  src: 'https://example.com/file1',
  content_type: 'image/png',
  size: 1024,
  created_at: Date.now(),
  indexed_at: Date.now(),
  metadata: {},
  owner_id: 'user1',
  uri: 'pubky://user1/pub/pubky.app/files/file1',
  urls: { feed: 'url1', main: 'url2', small: 'url3' },
});

describe('FileController', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    mockFileNormalizer.toBlob.mockReset();
    mockFileNormalizer.toFile.mockReset();
    mockFileApplication.upload.mockReset();
    mockFileApplication.getAvatarUrl.mockReset();
    mockFileApplication.getImageUrl.mockReset();
    mockFileApplication.getMetadata.mockReset();

    ({ FileController } = await import('./file'));
  });

  describe('upload', () => {
    it('normalizes file and uploads it', async () => {
      const file = createMockFile();
      const blobResult = createMockBlobResult();
      const fileResult = createMockFileResult();

      mockFileNormalizer.toBlob.mockReturnValue(blobResult);
      mockFileNormalizer.toFile.mockReturnValue(fileResult);
      mockFileApplication.upload.mockResolvedValue(undefined);

      const result = await FileController.upload({ file, pubky: testPubky });

      expect(mockFileNormalizer.toBlob).toHaveBeenCalledWith(expect.any(Uint8Array), testPubky);
      expect(mockFileNormalizer.toFile).toHaveBeenCalledWith(file, blobResult.meta.url, testPubky);
      expect(mockFileApplication.upload).toHaveBeenCalledWith({ blobResult, fileResult });
      expect(result).toBe(fileResult.meta.url);
    });

    it('propagates errors when blob normalization fails', async () => {
      const file = createMockFile();
      mockFileNormalizer.toBlob.mockImplementation(() => {
        throw new Error('normalizer failed');
      });

      await expect(FileController.upload({ file, pubky: testPubky })).rejects.toThrow('normalizer failed');
      expect(mockFileNormalizer.toFile).not.toHaveBeenCalled();
      expect(mockFileApplication.upload).not.toHaveBeenCalled();
    });

    it('propagates errors when file normalization fails', async () => {
      const file = createMockFile();
      mockFileNormalizer.toBlob.mockReturnValue(createMockBlobResult());
      mockFileNormalizer.toFile.mockImplementation(() => {
        throw new Error('file failed');
      });

      await expect(FileController.upload({ file, pubky: testPubky })).rejects.toThrow('file failed');
      expect(mockFileApplication.upload).not.toHaveBeenCalled();
    });

    it('propagates errors when homeserver upload fails', async () => {
      const file = createMockFile();
      mockFileNormalizer.toBlob.mockReturnValue(createMockBlobResult());
      mockFileNormalizer.toFile.mockReturnValue(createMockFileResult());
      mockFileApplication.upload.mockRejectedValue(new Error('upload failed'));

      await expect(FileController.upload({ file, pubky: testPubky })).rejects.toThrow('upload failed');
    });

    it('propagates errors when file.arrayBuffer() fails', async () => {
      const file = createMockFile();
      vi.spyOn(file, 'arrayBuffer').mockRejectedValue(new Error('arrayBuffer failed'));

      await expect(FileController.upload({ file, pubky: testPubky })).rejects.toThrow('arrayBuffer failed');
      expect(mockFileNormalizer.toBlob).not.toHaveBeenCalled();
      expect(mockFileNormalizer.toFile).not.toHaveBeenCalled();
      expect(mockFileApplication.upload).not.toHaveBeenCalled();
    });
  });

  describe('getAvatarUrl', () => {
    it('delegates to FileApplication.getAvatarUrl', () => {
      const expectedUrl = 'https://cdn.example.com/avatar/test-pubky';
      mockFileApplication.getAvatarUrl.mockReturnValue(expectedUrl);

      const result = FileController.getAvatarUrl(testPubky);

      expect(mockFileApplication.getAvatarUrl).toHaveBeenCalledWith(testPubky);
      expect(result).toBe(expectedUrl);
    });
  });

  describe('getImageUrl', () => {
    it('delegates to FileApplication.getImageUrl with correct parameters', () => {
      const fileId = 'user123:file456';
      const variant = FileVariant.SMALL;
      const expectedUrl = 'https://cdn.example.com/files/user123/file456/small';

      mockFileApplication.getImageUrl.mockReturnValue(expectedUrl);

      const result = FileController.getImageUrl({
        fileId,
        variant,
      });

      expect(mockFileApplication.getImageUrl).toHaveBeenCalledWith({
        fileId,
        variant,
      });
      expect(result).toBe(expectedUrl);
    });

    it('propagates errors when FileApplication.getImageUrl fails (e.g., invalid fileId)', () => {
      const invalidFileId = 'invalid-file-id';
      const variant = FileVariant.SMALL;
      const error = new Error('Invalid composite id: invalid-file-id');

      mockFileApplication.getImageUrl.mockImplementation(() => {
        throw error;
      });

      expect(() => FileController.getImageUrl({ fileId: invalidFileId, variant })).toThrow(
        'Invalid composite id: invalid-file-id',
      );
    });
  });

  describe('getMetadata', () => {
    it('delegates to FileApplication.getMetadata', async () => {
      const fileAttachments = ['pubky://user1/pub/pubky.app/files/file1', 'pubky://user2/pub/pubky.app/files/file2'];
      const expectedMetadata = [createMockMetadata()];

      mockFileApplication.getMetadata.mockResolvedValue(expectedMetadata);

      const result = await FileController.getMetadata({ fileAttachments });

      expect(mockFileApplication.getMetadata).toHaveBeenCalledWith({ fileAttachments });
      expect(result).toEqual(expectedMetadata);
    });

    it('propagates errors when FileApplication.getMetadata fails', async () => {
      mockFileApplication.getMetadata.mockRejectedValue(new Error('metadata fetch failed'));

      await expect(
        FileController.getMetadata({ fileAttachments: ['pubky://user1/pub/pubky.app/files/file1'] }),
      ).rejects.toThrow('metadata fetch failed');
    });

    it('handles empty array of fileAttachments', async () => {
      mockFileApplication.getMetadata.mockResolvedValue([]);

      const result = await FileController.getMetadata({ fileAttachments: [] });

      expect(mockFileApplication.getMetadata).toHaveBeenCalledWith({ fileAttachments: [] });
      expect(result).toEqual([]);
    });
  });
});
