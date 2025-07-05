import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthController } from './auth';
import { HomeserverService } from '@/core/services/homeserver';
import { Keypair } from '@synonymdev/pubky';
import * as bip39 from 'bip39';

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

// Mock crypto for browser environment
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
  writable: true,
});

describe('AuthController', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock store
    mockKeypairStore.publicKey = '';
    mockKeypairStore.secretKey = new Uint8Array(32).fill(1);
    mockKeypairStore.session = null;
    mockKeypairStore.isAuthenticated = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getKeypair', () => {
    it('should return current keypair if exists', async () => {
      const homeserverService = HomeserverService.getInstance();
      const mockKeypair = Keypair.fromSecretKey(new Uint8Array(32).fill(1));

      // Mock the service to return a keypair
      const spy = vi.spyOn(homeserverService, 'getCurrentKeypair').mockReturnValue(mockKeypair);

      const result = await AuthController.getKeypair();

      expect(spy).toHaveBeenCalled();
      expect(result).toBe(mockKeypair);

      spy.mockRestore();
    });

    it('should return null if no keypair exists', async () => {
      const homeserverService = HomeserverService.getInstance();

      // Mock the service to return null
      const spy = vi.spyOn(homeserverService, 'getCurrentKeypair').mockReturnValue(null);

      const result = await AuthController.getKeypair();

      expect(spy).toHaveBeenCalled();
      expect(result).toBeNull();

      spy.mockRestore();
    });
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
      const mockKeypair = Keypair.fromSecretKey(new Uint8Array(32).fill(1));

      const getCurrentKeypairSpy = vi.spyOn(homeserverService, 'getCurrentKeypair').mockReturnValue(mockKeypair);
      const logoutSpy = vi.spyOn(homeserverService, 'logout').mockResolvedValue(undefined);

      await AuthController.logout();

      expect(getCurrentKeypairSpy).toHaveBeenCalled();
      expect(logoutSpy).toHaveBeenCalled();

      getCurrentKeypairSpy.mockRestore();
      logoutSpy.mockRestore();
    });

    it('should throw error if no keypair exists', async () => {
      const homeserverService = HomeserverService.getInstance();

      const getCurrentKeypairSpy = vi.spyOn(homeserverService, 'getCurrentKeypair').mockReturnValue(null);

      await expect(AuthController.logout()).rejects.toThrow('No keypair available');
      expect(getCurrentKeypairSpy).toHaveBeenCalled();

      getCurrentKeypairSpy.mockRestore();
    });
  });

  describe('generateSeedWords', () => {
    it('should generate valid BIP39 seed words from a secret key', () => {
      // Create a valid 32-byte secret key
      const secretKey = new Uint8Array(32);
      crypto.getRandomValues(secretKey);

      const result = AuthController.generateSeedWords(secretKey);

      expect(result).toHaveLength(12);
      expect(result.every((word) => typeof word === 'string' && word.length > 0)).toBe(true);

      // Verify the generated mnemonic is valid
      const mnemonic = result.join(' ');
      expect(bip39.validateMnemonic(mnemonic)).toBe(true);
    });

    it('should generate consistent seed words for the same secret key', () => {
      // Create a specific secret key for consistency testing
      const secretKey = new Uint8Array(32);
      secretKey.fill(42); // Fill with a specific value for deterministic results

      const result1 = AuthController.generateSeedWords(secretKey);
      const result2 = AuthController.generateSeedWords(secretKey);

      expect(result1).toEqual(result2);
      expect(result1.join(' ')).toBe(result2.join(' '));
    });

    it('should throw error for null or undefined secret key', () => {
      expect(() => AuthController.generateSeedWords(null)).toThrow();
      expect(() => AuthController.generateSeedWords(undefined)).toThrow();
    });

    it('should throw error for non-Uint8Array input', () => {
      expect(() => AuthController.generateSeedWords('not-a-uint8array' as unknown as Uint8Array)).toThrow();
      expect(() => AuthController.generateSeedWords(123 as unknown as Uint8Array)).toThrow();
      expect(() => AuthController.generateSeedWords({} as unknown as Uint8Array)).toThrow();
    });

    it('should throw error for short secret keys', () => {
      // Create a short secret key (less than 32 bytes)
      const shortSecretKey = new Uint8Array(16);
      crypto.getRandomValues(shortSecretKey);

      // Should throw an error for short keys
      expect(() => AuthController.generateSeedWords(shortSecretKey)).toThrow(
        'Secret key is shorter than recommended 32 bytes',
      );
    });
  });

  describe('createRecoveryFile', () => {
    beforeEach(() => {
      // Mock document methods for file download
      Object.defineProperty(document, 'createElement', {
        value: vi.fn().mockImplementation((tagName) => {
          if (tagName === 'a') {
            return {
              href: '',
              download: '',
              click: vi.fn(),
              remove: vi.fn(),
            };
          }
          return {};
        }),
        writable: true,
      });

      Object.defineProperty(document.body, 'appendChild', {
        value: vi.fn(),
        writable: true,
      });

      Object.defineProperty(document.body, 'removeChild', {
        value: vi.fn(),
        writable: true,
      });

      // Mock URL methods
      Object.defineProperty(global, 'URL', {
        value: {
          createObjectURL: vi.fn().mockReturnValue('mock-url'),
          revokeObjectURL: vi.fn(),
        },
        writable: true,
      });

      // Mock Blob
      Object.defineProperty(global, 'Blob', {
        value: vi.fn().mockImplementation((content, options) => ({
          content,
          options,
        })),
        writable: true,
      });
    });

    it('should create recovery file successfully with valid keypair', async () => {
      const secretKey = new Uint8Array(32);
      crypto.getRandomValues(secretKey);

      const keypair = {
        publicKey: 'test-public-key',
        secretKey: secretKey,
      };

      await expect(AuthController.createRecoveryFile(keypair, 'password123')).resolves.not.toThrow();

      // Verify that the download process was initiated
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('should throw error for invalid secret key format', async () => {
      const keypair = {
        publicKey: 'test-public-key',
        secretKey: 'invalid' as unknown as Uint8Array,
      };

      await expect(AuthController.createRecoveryFile(keypair, 'password123')).rejects.toThrow();
    });

    it('should throw error for null secret key', async () => {
      const keypair = {
        publicKey: 'test-public-key',
        secretKey: null as unknown as Uint8Array,
      };

      await expect(AuthController.createRecoveryFile(keypair, 'password123')).rejects.toThrow();
    });

    it('should throw error for incorrect secret key length', async () => {
      const shortKey = new Uint8Array(16);
      const keypair = {
        publicKey: 'test-public-key',
        secretKey: shortKey,
      };

      await expect(AuthController.createRecoveryFile(keypair, 'password123')).rejects.toThrow();
    });
  });

  describe('handleDownloadRecoveryFile', () => {
    it('should handle file download successfully', async () => {
      const recoveryFile = new Uint8Array(32);
      crypto.getRandomValues(recoveryFile);

      await expect(
        AuthController.handleDownloadRecoveryFile({
          recoveryFile,
          filename: 'test-recovery.pkarr',
        }),
      ).resolves.not.toThrow();
    });

    it('should handle errors gracefully', async () => {
      await expect(
        AuthController.handleDownloadRecoveryFile({
          recoveryFile: new Uint8Array(0),
          filename: 'test.pkarr',
        }),
      ).resolves.not.toThrow();
    });
  });
});
