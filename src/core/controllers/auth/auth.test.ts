import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthController } from './auth';
import { HomeserverService } from '@/core';
import * as bip39 from 'bip39';

// Mock fetch globalmente
const fetchMock = vi.fn();
global.fetch = fetchMock;

// Mock bip39 module
vi.mock('bip39', () => ({
  entropyToMnemonic: vi.fn(),
  validateMnemonic: vi.fn(),
}));

// Mock @synonymdev/pubky module
vi.mock('@synonymdev/pubky', () => ({
  Keypair: {
    fromSecretKey: vi.fn().mockReturnValue({
      publicKey: vi.fn().mockReturnValue({ z32: () => 'mock-public-key' }),
    }),
  },
  createRecoveryFile: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3, 4, 5])),
}));

// Mock crypto module for deterministic testing
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn().mockImplementation((arr) => {
      // Fill with deterministic values for testing
      for (let i = 0; i < arr.length; i++) {
        arr[i] = i % 256;
      }
      return arr;
    }),
    createHash: vi.fn().mockImplementation(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue(Buffer.from('mock-hash-result-16-bytes-long', 'utf8').slice(0, 32)),
    })),
  },
  writable: true,
});

describe('AuthController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();

    // Set up default bip39 mock implementations
    vi.mocked(bip39.entropyToMnemonic).mockImplementation(() => {
      // Return a valid 12-word mnemonic for testing
      return 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    });

    vi.mocked(bip39.validateMnemonic).mockImplementation((mnemonic) => {
      // Accept our test mnemonic as valid, or any 12-word mnemonic that looks correct
      return (
        mnemonic === 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about' ||
        mnemonic.split(' ').length === 12
      );
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getKeypair', () => {
    it('should return current keypair if exists', async () => {
      const homeserverService = HomeserverService.getInstance();

      // Generate a keypair first
      const keypair = homeserverService.generateRandomKeypair();

      // Spy on the method
      const spy = vi.spyOn(homeserverService, 'getCurrentKeypair');

      const result = await AuthController.getKeypair();

      expect(spy).toHaveBeenCalled();
      expect(result).toBe(keypair);

      spy.mockRestore();
    });

    it('should return null if no keypair exists', async () => {
      const homeserverService = HomeserverService.getInstance();

      // Clear any existing keypair
      homeserverService['currentKeypair'] = null;

      // Spy on the method
      const spy = vi.spyOn(homeserverService, 'getCurrentKeypair');

      const result = await AuthController.getKeypair();

      expect(spy).toHaveBeenCalled();
      expect(result).toBeNull();

      spy.mockRestore();
    });
  });

  describe('signUp', () => {
    it('should successfully sign up a user', async () => {
      const homeserverService = HomeserverService.getInstance();
      const keypair = homeserverService.generateRandomKeypair();
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
      const keypair = homeserverService.generateRandomKeypair();
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

      // Ensure there's a keypair
      homeserverService.generateRandomKeypair();

      const getCurrentKeypairSpy = vi.spyOn(homeserverService, 'getCurrentKeypair');
      const logoutSpy = vi.spyOn(homeserverService, 'logout').mockResolvedValue(undefined);

      await AuthController.logout();

      expect(getCurrentKeypairSpy).toHaveBeenCalled();
      expect(logoutSpy).toHaveBeenCalled();

      getCurrentKeypairSpy.mockRestore();
      logoutSpy.mockRestore();
    });

    it('should throw error if no keypair exists', async () => {
      const homeserverService = HomeserverService.getInstance();

      // Clear any existing keypair
      homeserverService['currentKeypair'] = null;

      const getCurrentKeypairSpy = vi.spyOn(homeserverService, 'getCurrentKeypair');

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
      const validSecretKey = new Uint8Array(32);
      crypto.getRandomValues(validSecretKey);

      const keypair = {
        publicKey: 'mock-public-key',
        secretKey: validSecretKey,
      };

      await expect(AuthController.createRecoveryFile(keypair, 'password123')).resolves.not.toThrow();
    });

    it('should throw error for invalid secret key format', async () => {
      const keypair = {
        publicKey: 'mock-public-key',
        secretKey: 'not-a-uint8array' as unknown as Uint8Array,
      };

      await expect(AuthController.createRecoveryFile(keypair, 'password123')).rejects.toThrow(
        'Invalid secret key format',
      );
    });

    it('should throw error for null secret key', async () => {
      const keypair = {
        publicKey: 'mock-public-key',
        secretKey: null as unknown as Uint8Array,
      };

      await expect(AuthController.createRecoveryFile(keypair, 'password123')).rejects.toThrow(
        'Invalid secret key format',
      );
    });

    it('should throw error for incorrect secret key length', async () => {
      const invalidSecretKey = new Uint8Array(16); // Wrong length (should be 32)
      crypto.getRandomValues(invalidSecretKey);

      const keypair = {
        publicKey: 'mock-public-key',
        secretKey: invalidSecretKey,
      };

      await expect(AuthController.createRecoveryFile(keypair, 'password123')).rejects.toThrow(
        'Invalid secret key length',
      );
    });
  });

  describe('handleDownloadRecoveryFile', () => {
    beforeEach(() => {
      // Mock DOM elements and methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
        remove: vi.fn(),
      };

      Object.defineProperty(document, 'createElement', {
        value: vi.fn().mockReturnValue(mockLink),
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
          createObjectURL: vi.fn().mockReturnValue('mock-blob-url'),
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

    it('should handle file download successfully', async () => {
      const recoveryFile = new Uint8Array([1, 2, 3, 4, 5]);
      const filename = 'test-recovery.pkarr';

      await AuthController.handleDownloadRecoveryFile({ recoveryFile, filename });

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Mock console.log to verify error handling
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Make URL.createObjectURL throw an error
      vi.mocked(global.URL.createObjectURL).mockImplementation(() => {
        throw new Error('URL creation failed');
      });

      const recoveryFile = new Uint8Array([1, 2, 3, 4, 5]);
      const filename = 'test-recovery.pkarr';

      // Should not throw, but should log the error
      await AuthController.handleDownloadRecoveryFile({ recoveryFile, filename });

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
