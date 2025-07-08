import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthController } from './auth';
import { HomeserverService } from '@/core/services/homeserver';
import { Keypair } from '@synonymdev/pubky';

// Mock useKeypairStore
const mockKeypairStore = {
  publicKey: '',
  secretKey: new Uint8Array(32).fill(1),
  session: null,
  isAuthenticated: false,
  generateKeys: vi.fn(),
  setSession: vi.fn(),
  clearSession: vi.fn(),
};

vi.mock('@/core/stores', () => ({
  useKeypairStore: {
    getState: vi.fn(() => mockKeypairStore),
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

    // Reset mock store
    mockKeypairStore.secretKey = new Uint8Array(32).fill(1);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('signUp', () => {
    it('should successfully sign up a user', async () => {
      const homeserverService = HomeserverService.getInstance();
      const keypair = Keypair.fromSecretKey(new Uint8Array(32).fill(1));
      const signupToken = 'test-token';

      const signupSpy = vi.spyOn(homeserverService, 'signup').mockResolvedValue({
        session: {} as unknown as import('@synonymdev/pubky').Session,
      });

      const result = await AuthController.signUp(keypair, signupToken);

      expect(signupSpy).toHaveBeenCalledWith(keypair, signupToken);
      expect(result).toEqual({
        session: {},
      });

      signupSpy.mockRestore();
    });

    it('should throw error if signup fails', async () => {
      const homeserverService = HomeserverService.getInstance();
      const keypair = Keypair.fromSecretKey(new Uint8Array(32).fill(1));
      const signupToken = 'invalid-token';

      const signupSpy = vi.spyOn(homeserverService, 'signup').mockRejectedValue(new Error('Signup failed'));

      await expect(AuthController.signUp(keypair, signupToken)).rejects.toThrow('Signup failed');
      expect(signupSpy).toHaveBeenCalledWith(keypair, signupToken);

      signupSpy.mockRestore();
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const homeserverService = HomeserverService.getInstance();

      const logoutSpy = vi.spyOn(homeserverService, 'logout').mockResolvedValue(undefined);

      await AuthController.logout();

      expect(logoutSpy).toHaveBeenCalled();

      logoutSpy.mockRestore();
    });

    it('should handle logout errors gracefully', async () => {
      const homeserverService = HomeserverService.getInstance();

      const logoutSpy = vi.spyOn(homeserverService, 'logout').mockRejectedValue(new Error('Network error'));

      await expect(AuthController.logout()).rejects.toThrow('Network error');
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
