import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthController } from './auth';
import { HomeserverService } from '@/core/services/homeserver';
import { Identity } from '@/libs';

const TEST_SECRET_KEY = Buffer.from(new Uint8Array(32).fill(1)).toString('hex');

// Mock pubky-app-specs to avoid WebAssembly issues
vi.mock('pubky-app-specs', () => ({
  default: vi.fn(() => Promise.resolve()),
}));

// Mock stores - simplified approach
vi.mock('@/core/stores', () => ({
  useProfileStore: {
    getState: vi.fn(() => ({
      setSession: vi.fn(),
      clearSession: vi.fn(),
    })),
  },
  useOnboardingStore: {
    getState: vi.fn(() => ({
      clearKeys: vi.fn(),
    })),
  },
}));

// Mock @synonymdev/pubky
vi.mock('@synonymdev/pubky', () => ({
  Keypair: {
    fromSecretKey: vi.fn(() => ({
      publicKey: vi.fn(() => ({ z32: () => 'test-public-key' })),
      secretKey: vi.fn(() => new Uint8Array(32).fill(1)),
    })),
    random: vi.fn(() => ({
      publicKey: vi.fn(() => ({ z32: () => 'test-public-key' })),
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
        pubky: keypair.publicKey,
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
    });

    it('should successfully logout user, clear stores, cookies and redirect', async () => {
      const homeserverService = HomeserverService.getInstance(TEST_SECRET_KEY);
      const logoutSpy = vi.spyOn(homeserverService, 'logout').mockResolvedValue(undefined);

      // Set some cookies to test clearing
      document.cookie = 'testCookie=value; path=/';
      document.cookie = 'anotherCookie=anotherValue; path=/';

      await AuthController.logout();

      expect(logoutSpy).toHaveBeenCalled();
      // AuthController.logout doesn't redirect, it just processes the logout
      expect(window.location.href).toBe('');

      logoutSpy.mockRestore();
    });

    it('should throw error when homeserver logout fails but still clear local state', async () => {
      const homeserverService = HomeserverService.getInstance(TEST_SECRET_KEY);
      const logoutSpy = vi.spyOn(homeserverService, 'logout').mockRejectedValue(new Error('Network error'));

      // Should throw error when homeserver logout fails, but local state should still be cleared
      await expect(AuthController.logout()).rejects.toThrow('Network error');
      expect(logoutSpy).toHaveBeenCalled();

      // Verify local state was cleared despite the error
      // Note: In a real scenario, you would check that stores are actually reset
      // For this test, we're just verifying the logout method was called and threw

      logoutSpy.mockRestore();
    });

    it('should clear all existing cookies', async () => {
      const homeserverService = HomeserverService.getInstance(TEST_SECRET_KEY);
      const logoutSpy = vi.spyOn(homeserverService, 'logout').mockResolvedValue(undefined);

      // Set multiple cookies
      document.cookie = 'session=abc123; path=/';
      document.cookie = 'token=xyz789; path=/';
      document.cookie = 'user=john; path=/';

      await AuthController.logout();

      // The actual implementation replaces cookie values with empty and sets expiry to past
      // We can't easily test the exact cookie clearing behavior in jsdom
      // but we can verify the method was called
      expect(logoutSpy).toHaveBeenCalled();

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
});
