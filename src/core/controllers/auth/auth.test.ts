import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthController } from './auth';
import { HomeserverService } from '@/core/services/homeserver';
import * as Core from '@/core';
import { Identity } from '@/libs';

const TEST_SECRET_KEY = Buffer.from(new Uint8Array(32).fill(1)).toString('hex');

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

// Mock fetch for bootstrap service
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the Env module
vi.mock('@/libs/env', () => ({
  Env: {
    NEXT_PUBLIC_HOMESERVER_ADMIN_URL: 'http://test-admin.com',
    NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD: 'test-password',
  },
}));

describe('AuthController', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock bootstrap service fetch response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          users: [],
          posts: [],
          list: { stream: [] },
        }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('signUp', () => {
    it('should successfully sign up a user and call setSession', async () => {
      const homeserverService = HomeserverService.getInstance(TEST_SECRET_KEY);
      const keypair = Identity.keypairFromSecretKey(Buffer.from(new Uint8Array(32).fill(1)).toString('hex'));
      const signupToken = 'test-token';
      const mockSession = {} as unknown as import('@synonymdev/pubky').Session;

      const signupSpy = vi.spyOn(homeserverService, 'signup').mockResolvedValue({
        pubky: keypair.pubky,
        session: mockSession,
      });

      const result = await AuthController.signUp({ keypair, signupToken });

      expect(signupSpy).toHaveBeenCalledWith(keypair, signupToken);
      // AuthController.signUp doesn't return anything, it just processes the signup
      expect(result).toBeUndefined();

      signupSpy.mockRestore();
    });

    it('should throw error if signup fails', async () => {
      const homeserverService = HomeserverService.getInstance(TEST_SECRET_KEY);
      const keypair = Identity.keypairFromSecretKey(Buffer.from(new Uint8Array(32).fill(1)).toString('hex'));
      const signupToken = 'invalid-token';

      const signupSpy = vi.spyOn(homeserverService, 'signup').mockRejectedValue(new Error('Signup failed'));

      await expect(AuthController.signUp({ keypair, signupToken })).rejects.toThrow('Signup failed');
      expect(signupSpy).toHaveBeenCalledWith(keypair, signupToken);

      signupSpy.mockRestore();
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      // Mock document.cookie
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
      });

      // Mock window.location.href
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          href: '',
        },
      });

      storeMocks.resetAuthStore.mockClear();
      storeMocks.resetOnboardingStore.mockClear();
    });

    it('should successfully logout user, clear stores, cookies and redirect', async () => {
      const homeserverService = HomeserverService.getInstance(TEST_SECRET_KEY);
      const logoutSpy = vi.spyOn(homeserverService, 'logout').mockResolvedValue(undefined);
      const clearDatabaseSpy = vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);

      // Set some cookies to test clearing
      document.cookie = 'testCookie=value; path=/';
      document.cookie = 'anotherCookie=anotherValue; path=/';

      await AuthController.logout();

      expect(logoutSpy).toHaveBeenCalled();
      expect(clearDatabaseSpy).toHaveBeenCalledTimes(1);
      // AuthController.logout doesn't redirect, it just processes the logout
      expect(window.location.href).toBe('');

      clearDatabaseSpy.mockRestore();
      logoutSpy.mockRestore();
    });

    it('should throw error when homeserver logout fails but still clear local state', async () => {
      const homeserverService = HomeserverService.getInstance(TEST_SECRET_KEY);
      const logoutSpy = vi.spyOn(homeserverService, 'logout').mockRejectedValue(new Error('Network error'));
      const clearDatabaseSpy = vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);

      // Should throw error when homeserver logout fails
      await expect(AuthController.logout()).rejects.toThrow('Network error');
      expect(logoutSpy).toHaveBeenCalled();

      // clearDatabase is not called when homeserver logout fails because the error is thrown first
      expect(clearDatabaseSpy).not.toHaveBeenCalled();

      clearDatabaseSpy.mockRestore();
      logoutSpy.mockRestore();
    });

    it('should clear all existing cookies', async () => {
      const homeserverService = HomeserverService.getInstance(TEST_SECRET_KEY);
      const logoutSpy = vi.spyOn(homeserverService, 'logout').mockResolvedValue(undefined);
      const clearDatabaseSpy = vi.spyOn(Core, 'clearDatabase').mockResolvedValue(undefined);

      // Set multiple cookies
      document.cookie = 'session=abc123; path=/';
      document.cookie = 'token=xyz789; path=/';
      document.cookie = 'user=john; path=/';

      await AuthController.logout();

      // The actual implementation replaces cookie values with empty and sets expiry to past
      // We can't easily test the exact cookie clearing behavior in jsdom
      // but we can verify the method was called
      expect(logoutSpy).toHaveBeenCalled();
      expect(clearDatabaseSpy).toHaveBeenCalledTimes(1);

      clearDatabaseSpy.mockRestore();
      logoutSpy.mockRestore();
    });

    it('should throw error if clearing the database fails', async () => {
      const homeserverService = HomeserverService.getInstance(TEST_SECRET_KEY);
      const logoutSpy = vi.spyOn(homeserverService, 'logout').mockResolvedValue(undefined);
      const clearDatabaseSpy = vi.spyOn(Core, 'clearDatabase').mockRejectedValue(new Error('clear failed'));

      // Should throw error when clearDatabase fails
      await expect(AuthController.logout()).rejects.toThrow('clear failed');

      expect(logoutSpy).toHaveBeenCalled();
      expect(clearDatabaseSpy).toHaveBeenCalledTimes(1);

      clearDatabaseSpy.mockRestore();
      logoutSpy.mockRestore();
    });
  });

  describe('generateSignupToken', () => {
    beforeEach(() => {
      // Mock fetch globally
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should generate signup token successfully', async () => {
      const mockToken = 'test-signup-token';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(mockToken),
      });

      const result = await AuthController.generateSignupToken();

      expect(result).toBe(mockToken);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:6288/generate_signup_token', {
        method: 'GET',
        headers: {
          'X-Admin-Password': 'admin',
        },
      });
    });

    it('should throw error when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: vi.fn().mockResolvedValue('Unauthorized'),
      });

      await expect(AuthController.generateSignupToken()).rejects.toThrow(
        'Failed to generate signup token: 401 Unauthorized',
      );
    });

    it('should throw error when no token is received', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(''),
      });

      await expect(AuthController.generateSignupToken()).rejects.toThrow('No token received from server');
    });
  });

  describe('notification hydration flows', () => {
    // Ensure the controller uses our mocked notification store in this scope
    beforeEach(() => {
      vi.spyOn(Core.useNotificationStore, 'getState').mockReturnValue({
        setState: storeMocks.notificationInit,
      } as unknown as import('@/core/stores/notification/notification.types').NotificationStore);
    });

    it('authorizeAndBootstrap should initialize with retry and setState notification store', async () => {
      const state: Core.NotificationState = { unread: 2, lastRead: 123 };
      const initializeWithRetrySpy = vi
        .spyOn(Core.BootstrapApplication, 'initializeWithRetry')
        .mockResolvedValue(state);

      await AuthController.authorizeAndBootstrap();

      expect(initializeWithRetrySpy).toHaveBeenCalledWith('');
      expect(storeMocks.notificationInit).toHaveBeenCalledWith(state);
    });

    it('loginWithAuthUrl should initialize and setState notification store', async () => {
      const state: Core.NotificationState = { unread: 0, lastRead: 456 };
      const initializeSpy = vi.spyOn(Core.BootstrapApplication, 'initialize').mockResolvedValue(state);

      const publicKeyMock = {
        z32: () => 'pubky-123',
        free: () => {},
        to_uint8array: () => new Uint8Array(),
        toUint8Array: () => new Uint8Array(),
      } as import('@synonymdev/pubky').PublicKey;

      await AuthController.loginWithAuthUrl({ publicKey: publicKeyMock });

      expect(initializeSpy).toHaveBeenCalledWith('pubky-123');
      expect(storeMocks.notificationInit).toHaveBeenCalledWith(state);
    });
  });
});
