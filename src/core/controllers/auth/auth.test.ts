import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LastReadResult } from 'pubky-app-specs';
import { AuthController } from './auth';
import * as Core from '@/core';
import * as Libs from '@/libs';

const TEST_SECRET_KEY = Buffer.from(new Uint8Array(32).fill(1)).toString('hex');
const TEST_PUBKY = '5a1diz4pghi47ywdfyfzpit5f3bdomzt4pugpbmq4rngdd4iub4y';

const getLastReadUrl = (pubky: string) => `pubky://${pubky}/pub/pubky.app/last_read`;

const createMockKeypair = () =>
  ({
    pubky: vi.fn(() => ({ z32: () => 'test-pubky' })),
    secretKey: vi.fn(() => new Uint8Array(32).fill(1)),
    publicKey: vi.fn(() => ({ z32: () => 'test-pubky' })),
    free: vi.fn(),
  }) as unknown as import('@synonymdev/pubky').Keypair;

const createMockPublicKey = () =>
  ({
    z32: () => TEST_PUBKY,
    free: () => {},
    to_uint8array: () => new Uint8Array(),
    toUint8Array: () => new Uint8Array(),
  }) as import('@synonymdev/pubky').PublicKey;

const createMockEncryptedFile = () =>
  new File([new Uint8Array([1, 2, 3, 4, 5])], 'recovery.bin', { type: 'application/octet-stream' });

const setupOnboardingStore = () => {
  vi.spyOn(Core.useOnboardingStore, 'getState').mockReturnValue({
    secretKey: TEST_SECRET_KEY,
    reset: storeMocks.resetOnboardingStore,
  } as unknown as Core.OnboardingStore);
};

const setupNotificationMocks = () => {
  vi.spyOn(Core.useNotificationStore, 'getState').mockReturnValue({
    setState: storeMocks.notificationInit,
  } as unknown as import('@/core/stores/notification/notification.types').NotificationStore);

  vi.spyOn(Core.NotificationNormalizer, 'to').mockImplementation(
    (pubky: string) => ({ meta: { url: getLastReadUrl(pubky) } }) as LastReadResult,
  );
};

const setupAuthAndNotificationStores = () => {
  const authStore = storeMocks.getAuthState();
  vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue(authStore as unknown as Core.AuthStore);
  vi.spyOn(Core.useNotificationStore, 'getState').mockReturnValue({
    setState: storeMocks.notificationInit,
  } as unknown as import('@/core/stores/notification/notification.types').NotificationStore);
  return authStore;
};

// Mock pubky-app-specs to avoid WebAssembly issues
vi.mock('pubky-app-specs', () => ({
  default: vi.fn(() => Promise.resolve()),
}));

const storeMocks = vi.hoisted(() => {
  const resetAuthStore = vi.fn();
  const resetOnboardingStore = vi.fn();
  const notificationInit = vi.fn();

  return {
    resetAuthStore,
    resetOnboardingStore,
    notificationInit,
    getAuthState: vi.fn(() => ({
      setSession: vi.fn(),
      setCurrentUserPubky: vi.fn(),
      setAuthenticated: vi.fn(),
      reset: resetAuthStore,
    })),
    getOnboardingState: vi.fn(() => ({
      reset: resetOnboardingStore,
    })),
    getNotificationState: vi.fn(() => ({
      setState: notificationInit,
    })),
  };
});

// Mock stores - simplified approach
vi.mock('@/core/stores', () => ({
  useAuthStore: {
    getState: storeMocks.getAuthState,
  },
  useOnboardingStore: {
    getState: storeMocks.getOnboardingState,
  },
  useNotificationStore: {
    getState: storeMocks.getNotificationState,
  },
}));

// Mock @synonymdev/pubky
vi.mock('@synonymdev/pubky', () => ({
  Keypair: {
    fromSecretKey: vi.fn(() => ({
      pubky: vi.fn(() => ({ z32: () => 'test-public-key' })),
      secretKey: vi.fn(() => new Uint8Array(32).fill(1)),
    })),
    random: vi.fn(() => ({
      pubky: vi.fn(() => ({ z32: () => 'test-public-key' })),
      secretKey: vi.fn(() => new Uint8Array(32).fill(1)),
    })),
  },
  createRecoveryFile: vi.fn(() => new Uint8Array([1, 2, 3, 4, 5])),
}));

vi.mock('@/libs/env', () => ({
  Env: {
    NEXT_PUBLIC_HOMESERVER_ADMIN_URL: 'http://test-admin.com',
    NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD: 'test-password',
  },
}));

describe('AuthController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('authorizeAndBootstrap', () => {
    beforeEach(() => {
      setupNotificationMocks();
    });

    it('should wait 5 seconds, initialize bootstrap, and setState notification store', async () => {
      const notification: Core.NotificationState = { unread: 2, lastRead: 123 };
      const bootstrapResponse = { notification };
      const initializeSpy = vi.spyOn(Core.BootstrapApplication, 'initialize').mockResolvedValue(bootstrapResponse);
      const sleepSpy = vi.spyOn(Libs, 'sleep').mockResolvedValue(undefined);

      const authStoreState: Core.AuthStore = {
        currentUserPubky: TEST_PUBKY,
        session: null,
        isAuthenticated: false,
        setSession: vi.fn(),
        setCurrentUserPubky: vi.fn(),
        setAuthenticated: vi.fn(),
        reset: vi.fn(),
        selectCurrentUserPubky: vi.fn(() => TEST_PUBKY),
      };
      vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue(authStoreState);

      await AuthController.authorizeAndBootstrap();

      expect(sleepSpy).toHaveBeenCalledWith(5000);
      expect(initializeSpy).toHaveBeenCalledWith({
        pubky: TEST_PUBKY,
        lastReadUrl: getLastReadUrl(TEST_PUBKY),
      });
      expect(storeMocks.notificationInit).toHaveBeenCalledWith(notification);
      expect(authStoreState.setAuthenticated).toHaveBeenCalledWith(true);
    });

    it('should throw error when pubky is not available', async () => {
      const authStoreState: Core.AuthStore = {
        currentUserPubky: null,
        session: null,
        isAuthenticated: false,
        setSession: vi.fn(),
        setCurrentUserPubky: vi.fn(),
        setAuthenticated: vi.fn(),
        reset: vi.fn(),
        selectCurrentUserPubky: vi.fn(() => {
          throw new Error('Current user pubky is not available. User may not be authenticated.');
        }),
      };
      vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue(authStoreState);

      await expect(AuthController.authorizeAndBootstrap()).rejects.toThrow(
        'Current user pubky is not available. User may not be authenticated.',
      );
    });
  });

  describe('signUp', () => {
    beforeEach(() => {
      setupOnboardingStore();
    });

    it('should successfully sign up a user and call setSession', async () => {
      const keypair = Libs.Identity.keypairDataFromSecretKey(Buffer.from(new Uint8Array(32).fill(1)).toString('hex'));
      const signupToken = 'test-token';
      const mockSession = {} as unknown as import('@synonymdev/pubky').Session;

      const signUpSpy = vi.spyOn(Core.AuthApplication, 'signUp').mockResolvedValue({
        pubky: keypair.pubky,
        session: mockSession,
      });

      const authStore = storeMocks.getAuthState();
      vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue(authStore as unknown as Core.AuthStore);

      const result = await AuthController.signUp({ keypair, signupToken });

      expect(signUpSpy).toHaveBeenCalledWith({
        keypair,
        signupToken,
        secretKey: TEST_SECRET_KEY,
      });
      expect(authStore.setSession).toHaveBeenCalledWith(mockSession);
      expect(authStore.setCurrentUserPubky).toHaveBeenCalledWith(keypair.pubky);
      expect(authStore.setAuthenticated).toHaveBeenCalledWith(true);
      expect(result).toBeUndefined();
    });

    it('should throw error if signup fails', async () => {
      const keypair = Libs.Identity.keypairDataFromSecretKey(Buffer.from(new Uint8Array(32).fill(1)).toString('hex'));
      const signupToken = 'invalid-token';

      const signUpSpy = vi.spyOn(Core.AuthApplication, 'signUp').mockRejectedValue(new Error('Signup failed'));

      await expect(AuthController.signUp({ keypair, signupToken })).rejects.toThrow('Signup failed');
      expect(signUpSpy).toHaveBeenCalledWith({
        keypair,
        signupToken,
        secretKey: TEST_SECRET_KEY,
      });
    });
  });

  describe('loginWithMnemonic', () => {
    beforeEach(() => {
      setupOnboardingStore();
      vi.spyOn(Core.NotificationNormalizer, 'to').mockReturnValue({
        meta: { url: 'pubky://test-pubky/pub/pubky.app/last_read' },
      } as unknown as LastReadResult);
    });

    it('should successfully login with mnemonic and bootstrap', async () => {
      const mnemonic = 'test mnemonic phrase';
      const mockKeypair = createMockKeypair();
      const mockSession = {} as unknown as import('@synonymdev/pubky').Session;
      const mockData = { pubky: 'test-pubky' as Core.Pubky, session: mockSession };
      const mockNotification: Core.NotificationState = { unread: 0, lastRead: 123 };
      const bootstrapResponse = { notification: mockNotification };

      const keypairSpy = vi.spyOn(Libs.Identity, 'pubkyKeypairFromMnemonic').mockReturnValue(mockKeypair);
      const signInSpy = vi.spyOn(Core.AuthApplication, 'signIn').mockResolvedValue(mockData);
      const initializeSpy = vi.spyOn(Core.BootstrapApplication, 'initialize').mockResolvedValue(bootstrapResponse);

      const authStore = setupAuthAndNotificationStores();

      const result = await AuthController.loginWithMnemonic({ mnemonic });

      expect(keypairSpy).toHaveBeenCalledWith(mnemonic);
      expect(signInSpy).toHaveBeenCalledWith({ keypair: expect.any(Object), secretKey: TEST_SECRET_KEY });
      expect(authStore.setSession).toHaveBeenCalledWith(mockSession);
      expect(authStore.setCurrentUserPubky).toHaveBeenCalledWith('test-pubky');
      expect(initializeSpy).toHaveBeenCalledWith({
        pubky: 'test-pubky',
        lastReadUrl: getLastReadUrl('test-pubky'),
      });
      expect(storeMocks.notificationInit).toHaveBeenCalledWith(mockNotification);
      expect(authStore.setAuthenticated).toHaveBeenCalledWith(true);
      expect(result).toBe(true);
    });

    it('should return false if signIn returns undefined', async () => {
      const mnemonic = 'test mnemonic phrase';
      const mockKeypair = createMockKeypair();

      vi.spyOn(Libs.Identity, 'pubkyKeypairFromMnemonic').mockReturnValue(mockKeypair);
      vi.spyOn(Core.AuthApplication, 'signIn').mockResolvedValue(undefined);

      const initializeSpy = vi.spyOn(Core.BootstrapApplication, 'initialize');

      const result = await AuthController.loginWithMnemonic({ mnemonic });

      expect(initializeSpy).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should throw error if signIn fails', async () => {
      const mnemonic = 'test mnemonic phrase';
      const mockKeypair = createMockKeypair();

      vi.spyOn(Libs.Identity, 'pubkyKeypairFromMnemonic').mockReturnValue(mockKeypair);
      vi.spyOn(Core.AuthApplication, 'signIn').mockRejectedValue(new Error('Authentication failed'));

      await expect(AuthController.loginWithMnemonic({ mnemonic })).rejects.toThrow('Authentication failed');
    });
  });

  describe('loginWithEncryptedFile', () => {
    beforeEach(() => {
      setupOnboardingStore();
      vi.spyOn(Core.NotificationNormalizer, 'to').mockReturnValue({
        meta: { url: 'pubky://test-pubky/pub/pubky.app/last_read' },
      } as unknown as LastReadResult);
    });

    it('should successfully login with encrypted file and bootstrap', async () => {
      const encryptedFile = createMockEncryptedFile();
      const password = 'test-password';
      const mockKeypair = createMockKeypair();
      const mockSession = {} as unknown as import('@synonymdev/pubky').Session;
      const mockData = { pubky: 'test-pubky' as Core.Pubky, session: mockSession };
      const mockNotification: Core.NotificationState = { unread: 0, lastRead: 123 };
      const bootstrapResponse = { notification: mockNotification };

      const decryptSpy = vi.spyOn(Libs.Identity, 'decryptRecoveryFile').mockResolvedValue(mockKeypair);
      const signInSpy = vi.spyOn(Core.AuthApplication, 'signIn').mockResolvedValue(mockData);
      const initializeSpy = vi.spyOn(Core.BootstrapApplication, 'initialize').mockResolvedValue(bootstrapResponse);

      const authStore = setupAuthAndNotificationStores();

      const result = await AuthController.loginWithEncryptedFile({ encryptedFile, password });

      expect(decryptSpy).toHaveBeenCalledWith(encryptedFile, password);
      expect(signInSpy).toHaveBeenCalledWith({ keypair: expect.any(Object), secretKey: TEST_SECRET_KEY });
      expect(authStore.setSession).toHaveBeenCalledWith(mockSession);
      expect(authStore.setCurrentUserPubky).toHaveBeenCalledWith('test-pubky');
      expect(initializeSpy).toHaveBeenCalledWith({
        pubky: 'test-pubky',
        lastReadUrl: getLastReadUrl('test-pubky'),
      });
      expect(storeMocks.notificationInit).toHaveBeenCalledWith(mockNotification);
      expect(authStore.setAuthenticated).toHaveBeenCalledWith(true);
      expect(result).toBe(true);
    });

    it('should return false if signIn returns undefined', async () => {
      const encryptedFile = createMockEncryptedFile();
      const password = 'test-password';
      const mockKeypair = createMockKeypair();

      vi.spyOn(Libs.Identity, 'decryptRecoveryFile').mockResolvedValue(mockKeypair);
      vi.spyOn(Core.AuthApplication, 'signIn').mockResolvedValue(undefined);

      const initializeSpy = vi.spyOn(Core.BootstrapApplication, 'initialize');

      const result = await AuthController.loginWithEncryptedFile({ encryptedFile, password });

      expect(initializeSpy).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should throw error if decryption fails', async () => {
      const encryptedFile = createMockEncryptedFile();
      const password = 'wrong-password';

      vi.spyOn(Libs.Identity, 'decryptRecoveryFile').mockRejectedValue(new Error('Decryption failed'));

      await expect(AuthController.loginWithEncryptedFile({ encryptedFile, password })).rejects.toThrow(
        'Decryption failed',
      );
    });

    it('should throw error if signIn fails', async () => {
      const encryptedFile = createMockEncryptedFile();
      const password = 'test-password';
      const mockKeypair = createMockKeypair();

      vi.spyOn(Libs.Identity, 'decryptRecoveryFile').mockResolvedValue(mockKeypair);
      vi.spyOn(Core.AuthApplication, 'signIn').mockRejectedValue(new Error('Authentication failed'));

      await expect(AuthController.loginWithEncryptedFile({ encryptedFile, password })).rejects.toThrow(
        'Authentication failed',
      );
    });
  });

  describe('getAuthUrl', () => {
    beforeEach(() => {
      setupOnboardingStore();
    });

    it('should generate auth URL successfully', async () => {
      const mockAuthUrl = {
        url: 'https://example.com/auth?token=abc123',
        promise: Promise.resolve({} as unknown as import('@synonymdev/pubky').PublicKey),
      };
      const generateAuthUrlSpy = vi.spyOn(Core.AuthApplication, 'generateAuthUrl').mockResolvedValue(mockAuthUrl);

      const result = await AuthController.getAuthUrl();

      expect(result).toEqual(mockAuthUrl);
      expect(generateAuthUrlSpy).toHaveBeenCalledWith({ secretKey: TEST_SECRET_KEY });
    });

    it('should throw error when auth URL generation fails', async () => {
      const generateAuthUrlSpy = vi
        .spyOn(Core.AuthApplication, 'generateAuthUrl')
        .mockRejectedValue(new Error('Failed to generate auth URL'));

      await expect(AuthController.getAuthUrl()).rejects.toThrow('Failed to generate auth URL');
      expect(generateAuthUrlSpy).toHaveBeenCalledWith({ secretKey: TEST_SECRET_KEY });
    });
  });

  describe('loginWithAuthUrl', () => {
    beforeEach(() => {
      setupNotificationMocks();
    });

    it('should initialize and setState notification store', async () => {
      const notification: Core.NotificationState = { unread: 0, lastRead: 456 };
      const bootstrapResponse = { notification };
      const initializeSpy = vi.spyOn(Core.BootstrapApplication, 'initialize').mockResolvedValue(bootstrapResponse);

      const publicKeyMock = createMockPublicKey();

      const authStore = storeMocks.getAuthState();
      setupOnboardingStore();

      vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue(authStore as unknown as Core.AuthStore);

      await AuthController.loginWithAuthUrl({ publicKey: publicKeyMock });

      expect(storeMocks.resetOnboardingStore).toHaveBeenCalled();
      expect(authStore.setCurrentUserPubky).toHaveBeenCalledWith(TEST_PUBKY);
      expect(initializeSpy).toHaveBeenCalledWith({
        pubky: TEST_PUBKY,
        lastReadUrl: getLastReadUrl(TEST_PUBKY),
      });
      expect(storeMocks.notificationInit).toHaveBeenCalledWith(notification);
      expect(authStore.setAuthenticated).toHaveBeenCalledWith(true);
    });

    it('should throw error if bootstrap initialization fails', async () => {
      const initializeSpy = vi
        .spyOn(Core.BootstrapApplication, 'initialize')
        .mockRejectedValue(new Error('Bootstrap failed'));

      const publicKeyMock = createMockPublicKey();

      const authStore = storeMocks.getAuthState();
      setupOnboardingStore();
      vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue(authStore as unknown as Core.AuthStore);

      await expect(AuthController.loginWithAuthUrl({ publicKey: publicKeyMock })).rejects.toThrow('Bootstrap failed');
      expect(initializeSpy).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    const createAuthStore = (): Core.AuthStore => ({
      ...storeMocks.getAuthState(),
      currentUserPubky: 'test-pubky' as Core.Pubky,
      session: null,
      isAuthenticated: false,
      selectCurrentUserPubky: vi.fn(() => 'test-pubky' as Core.Pubky),
    });

    const createOnboardingStore = () =>
      ({
        secretKey: TEST_SECRET_KEY,
        reset: storeMocks.resetOnboardingStore,
      }) as unknown as Core.OnboardingStore;

    beforeEach(() => {
      Object.defineProperty(document, 'cookie', { writable: true, value: '' });
      Object.defineProperty(window, 'location', { writable: true, value: { href: '' } });
      storeMocks.resetAuthStore.mockClear();
      storeMocks.resetOnboardingStore.mockClear();
    });

    it('should successfully logout user, clear stores, cookies and redirect', async () => {
      const logoutSpy = vi.spyOn(Core.AuthApplication, 'logout').mockResolvedValue(undefined);
      const clearDatabaseSpy = vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);
      const clearCookiesSpy = vi.spyOn(Libs, 'clearCookies').mockImplementation(() => {});

      vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue(createAuthStore());
      vi.spyOn(Core.useOnboardingStore, 'getState').mockReturnValue(createOnboardingStore());

      document.cookie = 'testCookie=value; path=/';
      document.cookie = 'anotherCookie=anotherValue; path=/';

      await AuthController.logout();

      expect(logoutSpy).toHaveBeenCalledWith({ pubky: 'test-pubky', secretKey: TEST_SECRET_KEY });
      expect(storeMocks.resetOnboardingStore).toHaveBeenCalled();
      expect(storeMocks.resetAuthStore).toHaveBeenCalled();
      expect(clearCookiesSpy).toHaveBeenCalled();
      expect(clearDatabaseSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw error when homeserver logout fails and not clear local state', async () => {
      const logoutSpy = vi.spyOn(Core.AuthApplication, 'logout').mockRejectedValue(new Error('Network error'));
      const clearDatabaseSpy = vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);
      const clearCookiesSpy = vi.spyOn(Libs, 'clearCookies').mockImplementation(() => {});

      vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue(createAuthStore());
      vi.spyOn(Core.useOnboardingStore, 'getState').mockReturnValue(createOnboardingStore());

      await expect(AuthController.logout()).rejects.toThrow('Network error');
      expect(logoutSpy).toHaveBeenCalledWith({ pubky: 'test-pubky', secretKey: TEST_SECRET_KEY });
      // Local state should not be cleared if homeserver logout fails
      expect(storeMocks.resetOnboardingStore).not.toHaveBeenCalled();
      expect(storeMocks.resetAuthStore).not.toHaveBeenCalled();
      expect(clearCookiesSpy).not.toHaveBeenCalled();
      expect(clearDatabaseSpy).not.toHaveBeenCalled();
    });

    it('should clear all existing cookies', async () => {
      const logoutSpy = vi.spyOn(Core.AuthApplication, 'logout').mockResolvedValue(undefined);
      const clearDatabaseSpy = vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);
      const clearCookiesSpy = vi.spyOn(Libs, 'clearCookies').mockImplementation(() => {});

      vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue(createAuthStore());
      vi.spyOn(Core.useOnboardingStore, 'getState').mockReturnValue(createOnboardingStore());

      document.cookie = 'session=abc123; path=/';
      document.cookie = 'token=xyz789; path=/';
      document.cookie = 'user=john; path=/';

      await AuthController.logout();

      expect(logoutSpy).toHaveBeenCalled();
      expect(clearCookiesSpy).toHaveBeenCalled();
      expect(clearDatabaseSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw error if clearing the database fails', async () => {
      const logoutSpy = vi.spyOn(Core.AuthApplication, 'logout').mockResolvedValue(undefined);
      const clearDatabaseSpy = vi.spyOn(Core, 'clearDatabase').mockRejectedValue(new Error('clear failed'));
      const clearCookiesSpy = vi.spyOn(Libs, 'clearCookies').mockImplementation(() => {});

      vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue(createAuthStore());
      vi.spyOn(Core.useOnboardingStore, 'getState').mockReturnValue(createOnboardingStore());

      await expect(AuthController.logout()).rejects.toThrow('clear failed');
      expect(logoutSpy).toHaveBeenCalled();
      expect(clearCookiesSpy).toHaveBeenCalled();
      expect(clearDatabaseSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateSignupToken', () => {
    it('should generate signup token successfully', async () => {
      const generateSignupTokenSpy = vi
        .spyOn(Core.AuthApplication, 'generateSignupToken')
        .mockResolvedValue('test-token');
      const result = await AuthController.generateSignupToken();
      expect(result).toBe('test-token');
      expect(generateSignupTokenSpy).toHaveBeenCalled();
    });
  });
});
