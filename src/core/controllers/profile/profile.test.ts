import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserResult } from 'pubky-app-specs';
import type { Pubky } from '@/core/models/models.types';

const mockProfileApplication = {
  create: vi.fn(),
  read: vi.fn(),
  deleteAccount: vi.fn(),
  downloadData: vi.fn(),
  updateStatus: vi.fn(),
  updateProfile: vi.fn(),
};

const mockUserNormalizer = {
  to: vi.fn(),
  linksFromUi: vi.fn((links) =>
    (links ?? []).map((link: { label: string; url: string }) => ({ title: link.label, url: link.url })),
  ),
};

const mockOnboardingStore = {
  getState: vi.fn(() => ({
    setSecrets: vi.fn(),
    selectSecretKey: vi.fn(() => 'test-secret-key'),
  })),
};

const mockAuthStore = {
  getState: vi.fn(() => ({
    setCurrentUserPubky: vi.fn(),
  })),
};

const mockIdentity = {
  generateSecrets: vi.fn(() => ({
    secretKey: 'test-secret-key',
    mnemonic: 'test mnemonic phrase',
  })),
  pubkyFromSecret: vi.fn(() => 'test-pubky'),
  keypairFromSecretKey: vi.fn(() => ({ keypair: 'test-keypair' })),
  createRecoveryFile: vi.fn(),
};

vi.mock('@/core', async () => {
  const actual = await vi.importActual('@/core');
  return {
    ...actual,
    ProfileApplication: mockProfileApplication,
    UserNormalizer: mockUserNormalizer,
    useOnboardingStore: mockOnboardingStore,
    useAuthStore: mockAuthStore,
  };
});

vi.mock('@/libs', async () => {
  const actual = await vi.importActual('@/libs');
  return {
    ...actual,
    Identity: mockIdentity,
  };
});
const testPubky = 'o4dksfbqk85ogzdb5osziw6befigbuxmuxkuxq8434q89uj56uyy' as Pubky;

let ProfileController: typeof import('./profile').ProfileController;

describe('ProfileController', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    mockProfileApplication.create.mockReset();
    mockProfileApplication.read.mockReset();
    mockProfileApplication.deleteAccount.mockReset();
    mockProfileApplication.downloadData.mockReset();
    mockProfileApplication.updateStatus.mockReset();
    mockProfileApplication.updateProfile.mockReset();
    mockUserNormalizer.to.mockReset();
    mockIdentity.generateSecrets.mockReset();
    mockIdentity.pubkyFromSecret.mockReset();
    mockIdentity.keypairFromSecretKey.mockReset();
    mockIdentity.createRecoveryFile.mockReset();
    mockOnboardingStore.getState.mockReturnValue({
      setSecrets: vi.fn(),
      selectSecretKey: vi.fn(() => 'test-secret-key'),
    });
    mockAuthStore.getState.mockReturnValue({
      setCurrentUserPubky: vi.fn(),
    });

    ({ ProfileController } = await import('./profile'));
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

  describe('generateSecrets', () => {
    it('generates secrets and sets them in stores', () => {
      const mockSetSecrets = vi.fn();
      const mockSetCurrentUserPubky = vi.fn();

      mockOnboardingStore.getState.mockReturnValue({
        setSecrets: mockSetSecrets,
        selectSecretKey: vi.fn(() => 'test-secret-key'),
      });
      mockAuthStore.getState.mockReturnValue({
        setCurrentUserPubky: mockSetCurrentUserPubky,
      });
      mockIdentity.generateSecrets.mockReturnValue({
        secretKey: 'generated-secret-key',
        mnemonic: 'generated mnemonic',
      });
      mockIdentity.pubkyFromSecret.mockReturnValue('generated-pubky' as Pubky);

      ProfileController.generateSecrets();

      expect(mockIdentity.generateSecrets).toHaveBeenCalledTimes(1);
      expect(mockSetSecrets).toHaveBeenCalledWith({
        secretKey: 'generated-secret-key',
        mnemonic: 'generated mnemonic',
      });
      expect(mockIdentity.pubkyFromSecret).toHaveBeenCalledWith('generated-secret-key');
      expect(mockSetCurrentUserPubky).toHaveBeenCalledWith('generated-pubky');
    });
  });

  describe('createRecoveryFile', () => {
    it('creates recovery file from secret key', () => {
      const mockSelectSecretKey = vi.fn(() => 'test-secret-key');
      mockOnboardingStore.getState.mockReturnValue({
        setSecrets: vi.fn(),
        selectSecretKey: mockSelectSecretKey,
      });
      mockIdentity.keypairFromSecretKey.mockReturnValue({ keypair: 'test-keypair' });

      ProfileController.createRecoveryFile('test-passphrase');

      expect(mockSelectSecretKey).toHaveBeenCalledTimes(1);
      expect(mockIdentity.keypairFromSecretKey).toHaveBeenCalledWith('test-secret-key');
      expect(mockIdentity.createRecoveryFile).toHaveBeenCalledWith({
        keypair: { keypair: 'test-keypair' },
        passphrase: 'test-passphrase',
      });
    });

    it('throws error when secret key is not available', () => {
      const mockSelectSecretKey = vi.fn(() => {
        throw new Error('Secret key is not available');
      });
      mockOnboardingStore.getState.mockReturnValue({
        setSecrets: vi.fn(),
        selectSecretKey: mockSelectSecretKey,
      });

      expect(() => ProfileController.createRecoveryFile('test-passphrase')).toThrow(
        'Secret key is not available',
      );
      expect(mockIdentity.createRecoveryFile).not.toHaveBeenCalled();
    });
  });

  describe('read', () => {
    it('delegates to ProfileApplication.read', async () => {
      const userId = 'test-user-id' as Pubky;
      const mockUserDetails = {
        id: userId,
        name: 'Test User',
        bio: 'Test bio',
      };

      mockProfileApplication.read.mockResolvedValue(mockUserDetails);

      const result = await ProfileController.read({ userId });

      expect(mockProfileApplication.read).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(mockUserDetails);
    });

    it('propagates errors from ProfileApplication.read', async () => {
      const userId = 'test-user-id' as Pubky;
      const error = new Error('read failed');

      mockProfileApplication.read.mockRejectedValue(error);

      await expect(ProfileController.read({ userId })).rejects.toThrow('read failed');
    });
  });

  describe('deleteAccount', () => {
    it('delegates to ProfileApplication.deleteAccount', async () => {
      const setProgress = vi.fn();

      mockProfileApplication.deleteAccount.mockResolvedValue(undefined);

      await ProfileController.deleteAccount({ pubky: testPubky, setProgress });

      expect(mockProfileApplication.deleteAccount).toHaveBeenCalledWith({
        pubky: testPubky,
        setProgress,
      });
    });

    it('propagates errors from ProfileApplication.deleteAccount', async () => {
      const setProgress = vi.fn();
      const error = new Error('delete failed');

      mockProfileApplication.deleteAccount.mockRejectedValue(error);

      await expect(ProfileController.deleteAccount({ pubky: testPubky, setProgress })).rejects.toThrow(
        'delete failed',
      );
    });
  });

  describe('downloadData', () => {
    it('delegates to ProfileApplication.downloadData', async () => {
      const setProgress = vi.fn();

      mockProfileApplication.downloadData.mockResolvedValue(undefined);

      await ProfileController.downloadData({ pubky: testPubky, setProgress });

      expect(mockProfileApplication.downloadData).toHaveBeenCalledWith({
        pubky: testPubky,
        setProgress,
      });
    });

    it('propagates errors from ProfileApplication.downloadData', async () => {
      const setProgress = vi.fn();
      const error = new Error('download failed');

      mockProfileApplication.downloadData.mockRejectedValue(error);

      await expect(ProfileController.downloadData({ pubky: testPubky, setProgress })).rejects.toThrow(
        'download failed',
      );
    });
  });

  describe('updateStatus', () => {
    it('delegates to ProfileApplication.updateStatus', async () => {
      mockProfileApplication.updateStatus.mockResolvedValue(undefined);

      await ProfileController.updateStatus({ pubky: testPubky, status: 'vacationing' });

      expect(mockProfileApplication.updateStatus).toHaveBeenCalledWith({
        pubky: testPubky,
        status: 'vacationing',
      });
    });

    it('propagates errors from ProfileApplication.updateStatus', async () => {
      const error = new Error('update status failed');

      mockProfileApplication.updateStatus.mockRejectedValue(error);

      await expect(ProfileController.updateStatus({ pubky: testPubky, status: 'vacationing' })).rejects.toThrow(
        'update status failed',
      );
    });
  });

  describe('updateProfile', () => {
    it('normalizes profile data and delegates to application layer', async () => {
      const profile = {
        name: 'Updated User',
        bio: 'Updated bio',
        links: [{ label: 'GitHub', url: 'https://github.com' }],
      };

      mockProfileApplication.updateProfile.mockResolvedValue(undefined);

      await ProfileController.updateProfile(profile as { name: string; bio?: string; links?: { label: string; url: string }[] }, 'updated-image-url', testPubky);

      expect(mockUserNormalizer.linksFromUi).toHaveBeenCalledWith(profile.links);
      expect(mockProfileApplication.updateProfile).toHaveBeenCalledWith({
        pubky: testPubky,
        name: 'Updated User',
        bio: 'Updated bio',
        image: 'updated-image-url',
        links: [{ title: 'GitHub', url: 'https://github.com' }],
      });
    });

    it('defaults optional fields when not provided', async () => {
      const profile = {
        name: 'Updated User',
      };

      mockProfileApplication.updateProfile.mockResolvedValue(undefined);

      await ProfileController.updateProfile(profile as { name: string; bio?: string; links?: { label: string; url: string }[] }, null, testPubky);

      expect(mockProfileApplication.updateProfile).toHaveBeenCalledWith({
        pubky: testPubky,
        name: 'Updated User',
        bio: '',
        image: null,
        links: [],
      });
    });

    it('handles null image correctly', async () => {
      const profile = {
        name: 'Updated User',
        bio: 'Updated bio',
      };

      mockProfileApplication.updateProfile.mockResolvedValue(undefined);

      await ProfileController.updateProfile(profile as { name: string; bio?: string; links?: { label: string; url: string }[] }, null, testPubky);

      expect(mockProfileApplication.updateProfile).toHaveBeenCalledWith({
        pubky: testPubky,
        name: 'Updated User',
        bio: 'Updated bio',
        image: null,
        links: [],
      });
    });

    it('propagates errors from the application layer', async () => {
      const profile = {
        name: 'Updated User',
        bio: 'Updated bio',
      };
      const error = new Error('update failed');

      mockProfileApplication.updateProfile.mockRejectedValue(error);

      await expect(
        ProfileController.updateProfile(profile as { name: string; bio?: string; links?: { label: string; url: string }[] }, null, testPubky),
      ).rejects.toThrow('update failed');
    });
  });
});
