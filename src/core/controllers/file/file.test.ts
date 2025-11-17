import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TextDecoder, TextEncoder } from 'util';
import type { Pubky } from '@/core/models/models.types';

const mockFileNormalizer = {
  toBlob: vi.fn(),
  toFile: vi.fn(),
};

const mockFileApplication = {
  upload: vi.fn(),
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

const decoder = new TextDecoder();
const testPubky = 'o4dksfbqk85ogzdb5osziw6befigbuxmuxkuxq8434q89uj56uyy' as Pubky;

let FileController: typeof import('./file').FileController;

describe('FileController', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    mockFileNormalizer.toBlob.mockReset();
    mockFileNormalizer.toFile.mockReset();
    mockFileApplication.upload.mockReset();

    ({ FileController } = await import('./file'));
  });

  describe('upload', () => {
    it('normalizes file and uploads it', async () => {
      const file = new MockFile(['file content'], 'image.png', { type: 'image/png' });
      const blobResult = {
        blob: { data: new Uint8Array([1, 2, 3]) },
        meta: { url: 'blob-url' },
      };
      const fileResult = {
        file: { toJson: vi.fn() },
        meta: { url: 'file-url' },
      };

      mockFileNormalizer.toBlob.mockReturnValue(blobResult);
      mockFileNormalizer.toFile.mockReturnValue(fileResult);
      mockFileApplication.upload.mockResolvedValue(undefined);

      const result = await FileController.upload({ file, pubky: testPubky });

      expect(mockFileNormalizer.toBlob).toHaveBeenCalledTimes(1);
      const [blobArg, pubkyArg] = mockFileNormalizer.toBlob.mock.calls[0];
      expect(blobArg).toBeInstanceOf(Uint8Array);
      expect(decoder.decode(blobArg as Uint8Array)).toBe('file content');
      expect(pubkyArg).toBe(testPubky);

      expect(mockFileNormalizer.toFile).toHaveBeenCalledWith(file, blobResult.meta.url, testPubky);
      expect(mockFileApplication.upload).toHaveBeenCalledWith({ blobResult, fileResult });
      expect(result).toBe(fileResult.meta.url);
    });

    it('propagates errors when blob normalization fails', async () => {
      const file = new MockFile(['file content'], 'image.png', { type: 'image/png' });
      const error = new Error('normalizer failed');
      mockFileNormalizer.toBlob.mockImplementation(() => {
        throw error;
      });

      await expect(FileController.upload({ file, pubky: testPubky })).rejects.toThrow('normalizer failed');
      expect(mockFileNormalizer.toFile).not.toHaveBeenCalled();
      expect(mockFileApplication.upload).not.toHaveBeenCalled();
    });

    it('propagates errors when file normalization fails', async () => {
      const file = new MockFile(['file content'], 'image.png', { type: 'image/png' });
      const blobResult = {
        blob: { data: new Uint8Array([1, 2, 3]) },
        meta: { url: 'blob-url' },
      };

      mockFileNormalizer.toBlob.mockReturnValue(blobResult);
      mockFileNormalizer.toFile.mockImplementation(() => {
        throw new Error('file failed');
      });

      await expect(FileController.upload({ file, pubky: testPubky })).rejects.toThrow('file failed');
      expect(mockFileApplication.upload).not.toHaveBeenCalled();
    });

    it('propagates errors when homeserver upload fails', async () => {
      const file = new MockFile(['file content'], 'image.png', { type: 'image/png' });
      const blobResult = {
        blob: { data: new Uint8Array([1, 2, 3]) },
        meta: { url: 'blob-url' },
      };
      const fileResult = {
        file: { toJson: vi.fn() },
        meta: { url: 'file-url' },
      };

      mockFileNormalizer.toBlob.mockReturnValue(blobResult);
      mockFileNormalizer.toFile.mockReturnValue(fileResult);
      mockFileApplication.upload.mockRejectedValue(new Error('upload failed'));

      await expect(FileController.upload({ file, pubky: testPubky })).rejects.toThrow('upload failed');
    });
  });
});

