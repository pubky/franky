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

const _createMockPublicKey = () =>
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
  const initAuthStore = vi.fn();

  return {
    resetAuthStore,
    resetOnboardingStore,
    notificationInit,
    initAuthStore,
    getAuthState: vi.fn(() => ({
      init: initAuthStore,
      setSession: vi.fn(),
      setCurrentUserPubky: vi.fn(),
      setHasProfile: vi.fn(),
      setIsRestoringSession: vi.fn(),
      setHasHydrated: vi.fn(),
      reset: resetAuthStore,
      selectCurrentUserPubky: vi.fn(() => TEST_PUBKY),
      selectIsAuthenticated: vi.fn(() => false),
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

  describe('bootstrapWithDelay', () => {
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
        hasProfile: false,
        hasHydrated: false,
        selectIsAuthenticated: vi.fn(() => false),
        init: vi.fn(),
        setSession: vi.fn(),
        setCurrentUserPubky: vi.fn(),
        setHasProfile: vi.fn(),
        setHasHydrated: vi.fn(),
        reset: vi.fn(),
        selectCurrentUserPubky: vi.fn(() => TEST_PUBKY),
      };
      vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue(authStoreState);

      await AuthController.bootstrapWithDelay();

      expect(sleepSpy).toHaveBeenCalledWith(5000);
      expect(initializeSpy).toHaveBeenCalledWith({
        pubky: TEST_PUBKY,
        lastReadUrl: getLastReadUrl(TEST_PUBKY),
      });
      expect(storeMocks.notificationInit).toHaveBeenCalledWith(notification);
      expect(authStoreState.setHasProfile).toHaveBeenCalledWith(true);
    });
  });

  describe('signUp', () => {
    beforeEach(() => {
      setupOnboardingStore();
    });

    it('should successfully sign up a user and call init', async () => {
      const keypair = createMockKeypair();
      const signupToken = 'test-token';
      const mockSession = {} as unknown as import('@synonymdev/pubky').Session;
      const mockPubky = 'test-pubky' as Core.Pubky;

      const signUpSpy = vi.spyOn(Core.AuthApplication, 'signUp').mockResolvedValue({
        session: mockSession,
      });
      const keypairFromSecretKeySpy = vi.spyOn(Libs.Identity, 'keypairFromSecretKey').mockReturnValue(keypair);
      const pubkyFromSessionSpy = vi.spyOn(Libs.Identity, 'pubkyFromSession').mockReturnValue(mockPubky);
      const clearDatabaseSpy = vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);

      const authStore = storeMocks.getAuthState();
      vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue(authStore as unknown as Core.AuthStore);

      const result = await AuthController.signUp({ secretKey: TEST_SECRET_KEY, signupToken });

      expect(clearDatabaseSpy).toHaveBeenCalled();
      expect(keypairFromSecretKeySpy).toHaveBeenCalledWith(TEST_SECRET_KEY);
      expect(signUpSpy).toHaveBeenCalledWith({
        keypair,
        signupToken,
      });
      expect(pubkyFromSessionSpy).toHaveBeenCalledWith({ session: mockSession });
      expect(authStore.setSession).toHaveBeenCalledWith(mockSession);
      expect(authStore.setCurrentUserPubky).toHaveBeenCalledWith(mockPubky);
      expect(authStore.setHasProfile).toHaveBeenCalledWith(false);
      expect(result).toBeUndefined();
    });

    it('should throw error if signup fails', async () => {
      const keypair = createMockKeypair();
      const signupToken = 'invalid-token';

      const signUpSpy = vi.spyOn(Core.AuthApplication, 'signUp').mockRejectedValue(new Error('Signup failed'));
      const keypairFromSecretKeySpy = vi.spyOn(Libs.Identity, 'keypairFromSecretKey').mockReturnValue(keypair);
      const clearDatabaseSpy = vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);

      await expect(AuthController.signUp({ secretKey: TEST_SECRET_KEY, signupToken })).rejects.toThrow('Signup failed');
      expect(clearDatabaseSpy).toHaveBeenCalled();
      expect(keypairFromSecretKeySpy).toHaveBeenCalledWith(TEST_SECRET_KEY);
      expect(signUpSpy).toHaveBeenCalledWith({
        keypair,
        signupToken,
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
      const mockPubky = 'test-pubky' as Core.Pubky;
      const mockData = { session: mockSession };
      const mockNotification: Core.NotificationState = { unread: 0, lastRead: 123 };
      const bootstrapResponse = { notification: mockNotification };

      const keypairSpy = vi.spyOn(Libs.Identity, 'keypairFromMnemonic').mockReturnValue(mockKeypair);
      const signInSpy = vi.spyOn(Core.AuthApplication, 'signIn').mockResolvedValue(mockData);
      const pubkyFromSessionSpy = vi.spyOn(Libs.Identity, 'pubkyFromSession').mockReturnValue(mockPubky);
      const userIsSignedUpSpy = vi.spyOn(Core.AuthApplication, 'userIsSignedUp').mockResolvedValue(true);
      const initializeSpy = vi.spyOn(Core.BootstrapApplication, 'initialize').mockResolvedValue(bootstrapResponse);
      const clearDatabaseSpy = vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);

      const _authStore = setupAuthAndNotificationStores();

      const result = await AuthController.loginWithMnemonic({ mnemonic });

      expect(clearDatabaseSpy).toHaveBeenCalled();
      expect(keypairSpy).toHaveBeenCalledWith(mnemonic);
      expect(signInSpy).toHaveBeenCalledWith({ keypair: mockKeypair });
      expect(pubkyFromSessionSpy).toHaveBeenCalledWith({ session: mockSession });
      expect(userIsSignedUpSpy).toHaveBeenCalledWith({ pubky: mockPubky });
      expect(initializeSpy).toHaveBeenCalledWith({
        pubky: mockPubky,
        lastReadUrl: getLastReadUrl('test-pubky'),
      });
      expect(storeMocks.notificationInit).toHaveBeenCalledWith(mockNotification);
      expect(_authStore.setSession).toHaveBeenCalledWith(mockSession);
      expect(_authStore.setCurrentUserPubky).toHaveBeenCalledWith(mockPubky);
      expect(_authStore.setHasProfile).toHaveBeenCalledWith(true);
      expect(result).toBe(true);
    });

    it('should successfully login with mnemonic without bootstrap if user is not signed up', async () => {
      const mnemonic = 'test mnemonic phrase';
      const mockKeypair = createMockKeypair();
      const mockSession = {} as unknown as import('@synonymdev/pubky').Session;
      const mockPubky = 'test-pubky' as Core.Pubky;
      const mockData = { session: mockSession };

      const keypairSpy = vi.spyOn(Libs.Identity, 'keypairFromMnemonic').mockReturnValue(mockKeypair);
      const signInSpy = vi.spyOn(Core.AuthApplication, 'signIn').mockResolvedValue(mockData);
      const pubkyFromSessionSpy = vi.spyOn(Libs.Identity, 'pubkyFromSession').mockReturnValue(mockPubky);
      const userIsSignedUpSpy = vi.spyOn(Core.AuthApplication, 'userIsSignedUp').mockResolvedValue(false);
      const initializeSpy = vi.spyOn(Core.BootstrapApplication, 'initialize');
      const clearDatabaseSpy = vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);

      const _authStore = setupAuthAndNotificationStores();

      const result = await AuthController.loginWithMnemonic({ mnemonic });

      expect(clearDatabaseSpy).toHaveBeenCalled();
      expect(keypairSpy).toHaveBeenCalledWith(mnemonic);
      expect(signInSpy).toHaveBeenCalledWith({ keypair: mockKeypair });
      expect(pubkyFromSessionSpy).toHaveBeenCalledWith({ session: mockSession });
      expect(userIsSignedUpSpy).toHaveBeenCalledWith({ pubky: mockPubky });
      expect(initializeSpy).not.toHaveBeenCalled();
      expect(_authStore.setSession).toHaveBeenCalledWith(mockSession);
      expect(_authStore.setCurrentUserPubky).toHaveBeenCalledWith(mockPubky);
      expect(_authStore.setHasProfile).toHaveBeenCalledWith(false);
      expect(result).toBe(true);
    });

    it('should return false if signIn returns undefined', async () => {
      const mnemonic = 'test mnemonic phrase';
      const mockKeypair = createMockKeypair();

      vi.spyOn(Libs.Identity, 'keypairFromMnemonic').mockReturnValue(mockKeypair);
      vi.spyOn(Core.AuthApplication, 'signIn').mockResolvedValue(undefined);
      vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);

      const initializeSpy = vi.spyOn(Core.BootstrapApplication, 'initialize');

      const result = await AuthController.loginWithMnemonic({ mnemonic });

      expect(initializeSpy).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should throw error if signIn fails', async () => {
      const mnemonic = 'test mnemonic phrase';
      const mockKeypair = createMockKeypair();

      vi.spyOn(Libs.Identity, 'keypairFromMnemonic').mockReturnValue(mockKeypair);
      vi.spyOn(Core.AuthApplication, 'signIn').mockRejectedValue(new Error('Authentication failed'));
      vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);

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
      const mockPubky = 'test-pubky' as Core.Pubky;
      const mockData = { session: mockSession };
      const mockNotification: Core.NotificationState = { unread: 0, lastRead: 123 };
      const bootstrapResponse = { notification: mockNotification };

      const decryptSpy = vi.spyOn(Libs.Identity, 'decryptRecoveryFile').mockResolvedValue(mockKeypair);
      const signInSpy = vi.spyOn(Core.AuthApplication, 'signIn').mockResolvedValue(mockData);
      const pubkyFromSessionSpy = vi.spyOn(Libs.Identity, 'pubkyFromSession').mockReturnValue(mockPubky);
      const userIsSignedUpSpy = vi.spyOn(Core.AuthApplication, 'userIsSignedUp').mockResolvedValue(true);
      const initializeSpy = vi.spyOn(Core.BootstrapApplication, 'initialize').mockResolvedValue(bootstrapResponse);
      const clearDatabaseSpy = vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);

      const _authStore = setupAuthAndNotificationStores();

      const result = await AuthController.loginWithEncryptedFile({ encryptedFile, password });

      expect(clearDatabaseSpy).toHaveBeenCalled();
      expect(decryptSpy).toHaveBeenCalledWith({ encryptedFile, passphrase: password });
      expect(signInSpy).toHaveBeenCalledWith({ keypair: mockKeypair });
      expect(pubkyFromSessionSpy).toHaveBeenCalledWith({ session: mockSession });
      expect(userIsSignedUpSpy).toHaveBeenCalledWith({ pubky: mockPubky });
      expect(initializeSpy).toHaveBeenCalledWith({
        pubky: mockPubky,
        lastReadUrl: getLastReadUrl('test-pubky'),
      });
      expect(storeMocks.notificationInit).toHaveBeenCalledWith(mockNotification);
      expect(_authStore.setSession).toHaveBeenCalledWith(mockSession);
      expect(_authStore.setCurrentUserPubky).toHaveBeenCalledWith(mockPubky);
      expect(_authStore.setHasProfile).toHaveBeenCalledWith(true);
      expect(result).toBe(true);
    });

    it('should successfully login with encrypted file without bootstrap if user is not signed up', async () => {
      const encryptedFile = createMockEncryptedFile();
      const password = 'test-password';
      const mockKeypair = createMockKeypair();
      const mockSession = {} as unknown as import('@synonymdev/pubky').Session;
      const mockPubky = 'test-pubky' as Core.Pubky;
      const mockData = { session: mockSession };

      const decryptSpy = vi.spyOn(Libs.Identity, 'decryptRecoveryFile').mockResolvedValue(mockKeypair);
      const signInSpy = vi.spyOn(Core.AuthApplication, 'signIn').mockResolvedValue(mockData);
      const pubkyFromSessionSpy = vi.spyOn(Libs.Identity, 'pubkyFromSession').mockReturnValue(mockPubky);
      const userIsSignedUpSpy = vi.spyOn(Core.AuthApplication, 'userIsSignedUp').mockResolvedValue(false);
      const initializeSpy = vi.spyOn(Core.BootstrapApplication, 'initialize');
      const clearDatabaseSpy = vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);

      const _authStore = setupAuthAndNotificationStores();

      const result = await AuthController.loginWithEncryptedFile({ encryptedFile, password });

      expect(clearDatabaseSpy).toHaveBeenCalled();
      expect(decryptSpy).toHaveBeenCalledWith({ encryptedFile, passphrase: password });
      expect(signInSpy).toHaveBeenCalledWith({ keypair: mockKeypair });
      expect(pubkyFromSessionSpy).toHaveBeenCalledWith({ session: mockSession });
      expect(userIsSignedUpSpy).toHaveBeenCalledWith({ pubky: mockPubky });
      expect(initializeSpy).not.toHaveBeenCalled();
      expect(_authStore.setSession).toHaveBeenCalledWith(mockSession);
      expect(_authStore.setCurrentUserPubky).toHaveBeenCalledWith(mockPubky);
      expect(_authStore.setHasProfile).toHaveBeenCalledWith(false);
      expect(result).toBe(true);
    });

    it('should return false if signIn returns undefined', async () => {
      const encryptedFile = createMockEncryptedFile();
      const password = 'test-password';
      const mockKeypair = createMockKeypair();

      vi.spyOn(Libs.Identity, 'decryptRecoveryFile').mockResolvedValue(mockKeypair);
      vi.spyOn(Core.AuthApplication, 'signIn').mockResolvedValue(undefined);
      vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);

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
      vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);

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
        authorizationUrl: 'https://example.com/auth?token=abc123',
        awaitApproval: Promise.resolve({} as unknown as import('@synonymdev/pubky').Session),
      };
      const generateAuthUrlSpy = vi.spyOn(Core.AuthApplication, 'generateAuthUrl').mockResolvedValue(mockAuthUrl);
      const clearDatabaseSpy = vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);

      const result = await AuthController.getAuthUrl();

      expect(clearDatabaseSpy).toHaveBeenCalled();
      expect(result).toEqual(mockAuthUrl);
      expect(generateAuthUrlSpy).toHaveBeenCalled();
    });

    it('should throw error when auth URL generation fails', async () => {
      const generateAuthUrlSpy = vi
        .spyOn(Core.AuthApplication, 'generateAuthUrl')
        .mockRejectedValue(new Error('Failed to generate auth URL'));
      const clearDatabaseSpy = vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);

      await expect(AuthController.getAuthUrl()).rejects.toThrow('Failed to generate auth URL');
      expect(clearDatabaseSpy).toHaveBeenCalled();
      expect(generateAuthUrlSpy).toHaveBeenCalled();
    });
  });

  describe('initializeAuthenticatedSession', () => {
    beforeEach(() => {
      setupNotificationMocks();
    });

    it('should initialize session and bootstrap if user is signed up', async () => {
      const mockSession = {} as unknown as import('@synonymdev/pubky').Session;
      const mockPubky = TEST_PUBKY as Core.Pubky;
      const notification: Core.NotificationState = { unread: 0, lastRead: 456 };
      const bootstrapResponse = { notification };

      const pubkyFromSessionSpy = vi.spyOn(Libs.Identity, 'pubkyFromSession').mockReturnValue(mockPubky);
      const userIsSignedUpSpy = vi.spyOn(Core.AuthApplication, 'userIsSignedUp').mockResolvedValue(true);
      const initializeSpy = vi.spyOn(Core.BootstrapApplication, 'initialize').mockResolvedValue(bootstrapResponse);

      const authStore = storeMocks.getAuthState();
      vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue(authStore as unknown as Core.AuthStore);

      await AuthController.initializeAuthenticatedSession({ session: mockSession });

      expect(pubkyFromSessionSpy).toHaveBeenCalledWith({ session: mockSession });
      expect(userIsSignedUpSpy).toHaveBeenCalledWith({ pubky: mockPubky });
      expect(initializeSpy).toHaveBeenCalledWith({
        pubky: mockPubky,
        lastReadUrl: getLastReadUrl(TEST_PUBKY),
      });
      expect(storeMocks.notificationInit).toHaveBeenCalledWith(notification);
      expect(authStore.setSession).toHaveBeenCalledWith(mockSession);
      expect(authStore.setCurrentUserPubky).toHaveBeenCalledWith(mockPubky);
      expect(authStore.setHasProfile).toHaveBeenCalledWith(true);
    });

    it('should initialize session without bootstrap if user is not signed up', async () => {
      const mockSession = {} as unknown as import('@synonymdev/pubky').Session;
      const mockPubky = TEST_PUBKY as Core.Pubky;

      const pubkyFromSessionSpy = vi.spyOn(Libs.Identity, 'pubkyFromSession').mockReturnValue(mockPubky);
      const userIsSignedUpSpy = vi.spyOn(Core.AuthApplication, 'userIsSignedUp').mockResolvedValue(false);
      const initializeSpy = vi.spyOn(Core.BootstrapApplication, 'initialize');

      const authStore = storeMocks.getAuthState();
      vi.spyOn(Core.useAuthStore, 'getState').mockReturnValue(authStore as unknown as Core.AuthStore);

      await AuthController.initializeAuthenticatedSession({ session: mockSession });

      expect(pubkyFromSessionSpy).toHaveBeenCalledWith({ session: mockSession });
      expect(userIsSignedUpSpy).toHaveBeenCalledWith({ pubky: mockPubky });
      expect(initializeSpy).not.toHaveBeenCalled();
      expect(authStore.setSession).toHaveBeenCalledWith(mockSession);
      expect(authStore.setCurrentUserPubky).toHaveBeenCalledWith(mockPubky);
      expect(authStore.setHasProfile).toHaveBeenCalledWith(false);
    });
  });

  describe('logout', () => {
    const createAuthStore = (): Core.AuthStore => ({
      ...storeMocks.getAuthState(),
      currentUserPubky: 'test-pubky' as Core.Pubky,
      session: {} as unknown as import('@synonymdev/pubky').Session,
      hasProfile: false,
      hasHydrated: false,
      selectCurrentUserPubky: vi.fn(() => 'test-pubky' as Core.Pubky),
      setHasHydrated: vi.fn(),
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

      expect(logoutSpy).toHaveBeenCalledWith({ pubky: 'test-pubky' });
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
      expect(logoutSpy).toHaveBeenCalledWith({ pubky: 'test-pubky' });
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
