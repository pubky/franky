// Simplified ProfileController tests with minimal mocks using real Identity.generateKeypair

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Identity } from '@/libs/identity/identity';

// Create mock store objects that will hold the real generated keypair
const mockOnboardingStore = { secretKey: '' };
const mockAuthStore = { setCurrentUserPubky: vi.fn(), setAuthenticated: vi.fn() };
const mockHomeserver = {
  fetch: vi.fn().mockResolvedValue({ ok: true }),
  authenticateKeypair: vi.fn().mockResolvedValue({ ok: true }),
};

// Mock pubky-app-specs to allow real normalizers to run without errors
vi.mock('pubky-app-specs', () => ({
  PubkySpecsBuilder: class {
    createBlob(blob: Uint8Array) {
      return { blob: { data: blob }, meta: { url: 'test-blob-url' } };
    }
    createFile(name: string, url: string, type: string, size: number) {
      return { file: { toJson: () => ({ name, url, type, size }) }, meta: { url: 'test-file-url' } };
    }
    createUser(name: string, bio: string, image: string, links: Array<{ title: string; url: string }>) {
      return { user: { toJson: () => ({ name, bio, image, links }) }, meta: { url: 'test-user-url' } };
    }
  },
}));

// Create a proper File mock with arrayBuffer method
class MockFile extends File {
  constructor(content: string[], filename: string, options?: FilePropertyBag) {
    super(content, filename, options);
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    const content = 'test';
    const buffer = new ArrayBuffer(content.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < content.length; i++) {
      view[i] = content.charCodeAt(i);
    }
    return Promise.resolve(buffer);
  }
}

describe('ProfileController', () => {
  let testKeypair: ReturnType<typeof Identity.generateKeypair>;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    // Generate fresh keypair using real Identity.generateKeypair function
    testKeypair = Identity.generateKeypair();

    // Set the real generated secret key in the mock store
    mockOnboardingStore.secretKey = testKeypair.secretKey;

    // Reset mock functions
    mockAuthStore.setCurrentUserPubky.mockClear();
    mockAuthStore.setAuthenticated.mockClear();
    mockHomeserver.fetch.mockClear();
    mockHomeserver.authenticateKeypair.mockClear();

    // Mock @/core after resetting modules
    vi.doMock('@/core', async () => {
      const actual = await vi.importActual('@/core');
      return {
        ...actual,
        useOnboardingStore: {
          getState: vi.fn(() => mockOnboardingStore),
        },
        useAuthStore: {
          getState: vi.fn(() => mockAuthStore),
        },
        HomeserverService: {
          getInstance: vi.fn(() => mockHomeserver),
        },
      };
    });
  });

  describe('uploadAvatar', () => {
    const mockAvatarFile = new MockFile(['test'], 'test.jpg', { type: 'image/jpeg' });

    it('exists and is callable', async () => {
      const { ProfileController } = await import('./profile');
      expect(ProfileController.uploadAvatar).toBeTypeOf('function');
    });

    it('calls dependencies and returns url', async () => {
      mockHomeserver.fetch.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({ ok: true });

      const { ProfileController } = await import('./profile');
      const result = await ProfileController.uploadAvatar(mockAvatarFile, testKeypair.pubky);
      expect(typeof result).toBe('string');
      expect(mockHomeserver.fetch).toHaveBeenCalledTimes(2);
      expect(mockHomeserver.authenticateKeypair).toHaveBeenCalled();
    });

    it('throws on missing secretKey', async () => {
      mockOnboardingStore.secretKey = '';

      const { ProfileController } = await import('./profile');
      await expect(ProfileController.uploadAvatar(mockAvatarFile, testKeypair.pubky)).rejects.toThrow('secretKey');
    });
  });

  describe('create', () => {
    const mockProfile = { name: 'Test', bio: 'Test bio' };
    const mockImage = 'test-image';

    it('exists and is callable', async () => {
      const { ProfileController } = await import('./profile');
      expect(ProfileController.create).toBeTypeOf('function');
    });

    it('calls dependencies and returns response', async () => {
      mockHomeserver.fetch.mockResolvedValue({ ok: true });

      const { ProfileController } = await import('./profile');
      const result = await ProfileController.create(mockProfile, mockImage, testKeypair.pubky);
      expect(result.ok).toBe(true);
      expect(mockHomeserver.fetch).toHaveBeenCalled();
      expect(mockHomeserver.authenticateKeypair).toHaveBeenCalled();
      expect(mockAuthStore.setAuthenticated).toHaveBeenCalledWith(true);
      expect(mockAuthStore.setCurrentUserPubky).toHaveBeenCalledWith(testKeypair.pubky);
    });

    it('throws on missing secretKey', async () => {
      mockOnboardingStore.secretKey = '';

      const { ProfileController } = await import('./profile');
      await expect(ProfileController.create(mockProfile, mockImage, testKeypair.pubky)).rejects.toThrow('secretKey');
      expect(mockAuthStore.setAuthenticated).toHaveBeenCalledWith(false);
      expect(mockAuthStore.setCurrentUserPubky).toHaveBeenCalledWith(null);
    });
  });
});
