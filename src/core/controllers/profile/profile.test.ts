import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TextDecoder, TextEncoder } from 'util';
import { UserResult } from 'pubky-app-specs';
import type { Pubky } from '@/core/models/models.types';

const mockFileNormalizer = {
  toBlob: vi.fn(),
  toFile: vi.fn(),
};

const mockProfileApplication = {
  uploadAvatar: vi.fn(),
  create: vi.fn(),
};

const mockUserNormalizer = {
  to: vi.fn(),
};

vi.mock('@/core', async () => {
  const actual = await vi.importActual('@/core');
  return {
    ...actual,
    FileNormalizer: mockFileNormalizer,
    ProfileApplication: mockProfileApplication,
    UserNormalizer: mockUserNormalizer,
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
    // @ts-expect-error - slice(0) narrows from ArrayBufferView to ArrayBuffer for test env
    return view.buffer.slice(0);
  }
}

const decoder = new TextDecoder();
const testPubky = 'o4dksfbqk85ogzdb5osziw6befigbuxmuxkuxq8434q89uj56uyy' as Pubky;

let ProfileController: typeof import('./profile').ProfileController;

describe('ProfileController', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    mockFileNormalizer.toBlob.mockReset();
    mockFileNormalizer.toFile.mockReset();
    mockProfileApplication.uploadAvatar.mockReset();
    mockProfileApplication.create.mockReset();
    mockUserNormalizer.to.mockReset();

    ({ ProfileController } = await import('./profile'));
  });

  describe('uploadAvatar', () => {
    it('normalizes avatar and uploads it', async () => {
      const avatarFile = new MockFile(['avatar'], 'avatar.png', { type: 'image/png' });
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
      mockProfileApplication.uploadAvatar.mockResolvedValue(undefined);

      const result = await ProfileController.uploadAvatar(avatarFile, testPubky);

      expect(mockFileNormalizer.toBlob).toHaveBeenCalledTimes(1);
      const [blobArg, pubkyArg] = mockFileNormalizer.toBlob.mock.calls[0];
      expect(blobArg).toBeInstanceOf(Uint8Array);
      expect(decoder.decode(blobArg as Uint8Array)).toBe('avatar');
      expect(pubkyArg).toBe(testPubky);

      expect(mockFileNormalizer.toFile).toHaveBeenCalledWith(avatarFile, blobResult.meta.url, testPubky);
      expect(mockProfileApplication.uploadAvatar).toHaveBeenCalledWith({ blobResult, fileResult });
      expect(result).toBe(fileResult.meta.url);
    });

    it('propagates errors when blob normalization fails', async () => {
      const avatarFile = new MockFile(['avatar'], 'avatar.png', { type: 'image/png' });
      const error = new Error('normalizer failed');
      mockFileNormalizer.toBlob.mockImplementation(() => {
        throw error;
      });

      await expect(ProfileController.uploadAvatar(avatarFile, testPubky)).rejects.toThrow('normalizer failed');
      expect(mockFileNormalizer.toFile).not.toHaveBeenCalled();
      expect(mockProfileApplication.uploadAvatar).not.toHaveBeenCalled();
    });

    it('propagates errors when file normalization fails', async () => {
      const avatarFile = new MockFile(['avatar'], 'avatar.png', { type: 'image/png' });
      const blobResult = {
        blob: { data: new Uint8Array([1, 2, 3]) },
        meta: { url: 'blob-url' },
      };

      mockFileNormalizer.toBlob.mockReturnValue(blobResult);
      mockFileNormalizer.toFile.mockImplementation(() => {
        throw new Error('file failed');
      });

      await expect(ProfileController.uploadAvatar(avatarFile, testPubky)).rejects.toThrow('file failed');
      expect(mockProfileApplication.uploadAvatar).not.toHaveBeenCalled();
    });

    it('propagates errors when homeserver upload fails', async () => {
      const avatarFile = new MockFile(['avatar'], 'avatar.png', { type: 'image/png' });
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
      mockProfileApplication.uploadAvatar.mockRejectedValue(new Error('upload failed'));

      await expect(ProfileController.uploadAvatar(avatarFile, testPubky)).rejects.toThrow('upload failed');
    });
  });

  describe('create', () => {
    it('normalizes profile data and delegates to application layer', async () => {
      const profile = {
        name: 'Test User',
        bio: 'Short bio',
        links: [{ label: 'Docs', url: 'https://example.com' }],
      };
      const userResult = {
        user: { toJson: vi.fn() },
        meta: { url: 'user-url' },
      };

      mockUserNormalizer.to.mockReturnValue(userResult as unknown as UserResult);
      mockProfileApplication.create.mockResolvedValue(undefined);

      await ProfileController.create(
        profile as { name: string; bio?: string; links?: { label: string; url: string }[] },
        'image-url',
        testPubky,
      );

      expect(mockUserNormalizer.to).toHaveBeenCalledTimes(1);
      expect(mockUserNormalizer.to).toHaveBeenCalledWith(
        {
          name: 'Test User',
          bio: 'Short bio',
          image: 'image-url',
          links: [{ title: 'Docs', url: 'https://example.com' }],
          status: '',
        },
        testPubky,
      );

      expect(mockProfileApplication.create).toHaveBeenCalledWith({
        profile: userResult.user,
        url: userResult.meta.url,
        pubky: testPubky,
      });
    });

    it('defaults optional fields when not provided', async () => {
      const profile = {
        name: 'Test User',
      };
      const userResult = {
        user: { toJson: vi.fn() },
        meta: { url: 'user-url' },
      };

      mockUserNormalizer.to.mockReturnValue(userResult as unknown as UserResult);
      mockProfileApplication.create.mockResolvedValue(undefined);

      await ProfileController.create(
        profile as { name: string; bio?: string; links?: { label: string; url: string }[] },
        null,
        testPubky,
      );

      expect(mockUserNormalizer.to).toHaveBeenCalledWith(
        {
          name: 'Test User',
          bio: '',
          image: '',
          links: [],
          status: '',
        },
        testPubky,
      );

      expect(mockProfileApplication.create).toHaveBeenCalledWith({
        profile: userResult.user,
        url: userResult.meta.url,
        pubky: testPubky,
      });
    });

    it('propagates errors from the user normalizer', async () => {
      const profile = {
        name: 'Test User',
        bio: 'Short bio',
      };
      const error = new Error('validation failed');

      mockUserNormalizer.to.mockImplementation(() => {
        throw error;
      });

      await expect(
        ProfileController.create(
          profile as { name: string; bio?: string; links?: { label: string; url: string }[] },
          null,
          testPubky,
        ),
      ).rejects.toThrow('validation failed');
      expect(mockProfileApplication.create).not.toHaveBeenCalled();
    });

    it('propagates errors from the application layer', async () => {
      const profile = {
        name: 'Test User',
        bio: 'Short bio',
      };
      const userResult = {
        user: { toJson: vi.fn() },
        meta: { url: 'user-url' },
      };

      mockUserNormalizer.to.mockReturnValue(userResult as unknown as UserResult);
      mockProfileApplication.create.mockRejectedValue(new Error('create failed'));

      await expect(
        ProfileController.create(
          profile as { name: string; bio?: string; links?: { label: string; url: string }[] },
          null,
          testPubky,
        ),
      ).rejects.toThrow('create failed');
    });
  });
});
