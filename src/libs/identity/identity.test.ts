import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Identity } from './identity';
import { createRecoveryFile } from '@synonymdev/pubky';
import * as bip39 from 'bip39';
import { CommonErrorType } from '@/libs';

// Mock @synonymdev/pubky
vi.mock('@synonymdev/pubky', () => ({
  Keypair: {
    fromSecretKey: vi.fn(() => ({
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

describe('Identity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateSeedWords', () => {
    it('should generate valid BIP39 seed words from a secret key', () => {
      // Create a valid 32-byte secret key
      const secretKey = new Uint8Array(32);
      crypto.getRandomValues(secretKey);

      const result = Identity.generateSeedWords(secretKey);

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

      const result1 = Identity.generateSeedWords(secretKey);
      const result2 = Identity.generateSeedWords(secretKey);

      expect(result1).toEqual(result2);
      expect(result1.join(' ')).toBe(result2.join(' '));
    });

    it('should throw error for null or undefined secret key', () => {
      expect(() => Identity.generateSeedWords(null)).toThrow();
      expect(() => Identity.generateSeedWords(undefined)).toThrow();
    });

    it('should throw error for non-Uint8Array input', () => {
      expect(() => Identity.generateSeedWords('not-a-uint8array' as unknown as Uint8Array)).toThrow();
      expect(() => Identity.generateSeedWords(123 as unknown as Uint8Array)).toThrow();
      expect(() => Identity.generateSeedWords({} as unknown as Uint8Array)).toThrow();
    });

    it('should throw error for short secret keys', () => {
      // Create a short secret key (less than 32 bytes)
      const shortSecretKey = new Uint8Array(16);
      crypto.getRandomValues(shortSecretKey);

      // Should throw an error for short keys
      expect(() => Identity.generateSeedWords(shortSecretKey)).toThrow(
        'Secret key is shorter than recommended 32 bytes',
      );
    });

    it('should throw CommonError with proper error type for invalid input', () => {
      try {
        Identity.generateSeedWords(null);
      } catch (error) {
        expect(error).toHaveProperty('type', CommonErrorType.INVALID_INPUT);
        expect(error).toHaveProperty('statusCode', 400);
      }
    });

    it('should throw CommonError with proper error type for short keys', () => {
      const shortSecretKey = new Uint8Array(16);

      try {
        Identity.generateSeedWords(shortSecretKey);
      } catch (error) {
        expect(error).toHaveProperty('type', CommonErrorType.INVALID_INPUT);
        expect(error).toHaveProperty('statusCode', 400);
      }
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

      await expect(Identity.createRecoveryFile(keypair, 'password123')).resolves.not.toThrow();

      // Verify that the download process was initiated
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('should throw error for invalid secret key format', async () => {
      const keypair = {
        publicKey: 'test-public-key',
        secretKey: 'invalid' as unknown as Uint8Array,
      };

      await expect(Identity.createRecoveryFile(keypair, 'password123')).rejects.toThrow();
    });

    it('should throw error for null secret key', async () => {
      const keypair = {
        publicKey: 'test-public-key',
        secretKey: null as unknown as Uint8Array,
      };

      await expect(Identity.createRecoveryFile(keypair, 'password123')).rejects.toThrow();
    });

    it('should throw error for incorrect secret key length', async () => {
      const shortKey = new Uint8Array(16);
      const keypair = {
        publicKey: 'test-public-key',
        secretKey: shortKey,
      };

      await expect(Identity.createRecoveryFile(keypair, 'password123')).rejects.toThrow();
    });

    it('should throw CommonError with proper error type for invalid secret key', async () => {
      const keypair = {
        publicKey: 'test-public-key',
        secretKey: null as unknown as Uint8Array,
      };

      try {
        await Identity.createRecoveryFile(keypair, 'password123');
      } catch (error) {
        expect(error).toHaveProperty('type', CommonErrorType.INVALID_INPUT);
        expect(error).toHaveProperty('statusCode', 400);
      }
    });

    it('should throw CommonError with proper error type for invalid secret key length', async () => {
      const shortKey = new Uint8Array(16);
      const keypair = {
        publicKey: 'test-public-key',
        secretKey: shortKey,
      };

      try {
        await Identity.createRecoveryFile(keypair, 'password123');
      } catch (error) {
        expect(error).toHaveProperty('type', CommonErrorType.INVALID_INPUT);
        expect(error).toHaveProperty('statusCode', 400);
      }
    });

    it('should handle createRecoveryFile errors and throw CommonError', async () => {
      const secretKey = new Uint8Array(32);
      crypto.getRandomValues(secretKey);

      const keypair = {
        publicKey: 'test-public-key',
        secretKey: secretKey,
      };

      // Mock createRecoveryFile to throw an error
      vi.mocked(createRecoveryFile).mockImplementationOnce(() => {
        throw new Error('Recovery file creation failed');
      });

      try {
        await Identity.createRecoveryFile(keypair, 'password123');
      } catch (error) {
        expect(error).toHaveProperty('type', CommonErrorType.UNEXPECTED_ERROR);
        expect(error).toHaveProperty('statusCode', 500);
      }
    });
  });

  describe('handleDownloadRecoveryFile', () => {
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

    it('should handle file download successfully', async () => {
      const recoveryFile = new Uint8Array(32);
      crypto.getRandomValues(recoveryFile);

      await expect(
        Identity.handleDownloadRecoveryFile({
          recoveryFile,
          filename: 'test-recovery.pkarr',
        }),
      ).resolves.not.toThrow();

      // Verify the download process
      expect(global.Blob).toHaveBeenCalledWith([recoveryFile], { type: 'application/octet-stream' });
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Mock Blob to throw an error
      Object.defineProperty(global, 'Blob', {
        value: vi.fn().mockImplementation(() => {
          throw new Error('Blob creation failed');
        }),
        writable: true,
      });

      await expect(
        Identity.handleDownloadRecoveryFile({
          recoveryFile: new Uint8Array(0),
          filename: 'test.pkarr',
        }),
      ).resolves.not.toThrow();
    });

    it('should handle empty recovery file', async () => {
      await expect(
        Identity.handleDownloadRecoveryFile({
          recoveryFile: new Uint8Array(0),
          filename: 'test.pkarr',
        }),
      ).resolves.not.toThrow();

      expect(global.Blob).toHaveBeenCalledWith([new Uint8Array(0)], { type: 'application/octet-stream' });
    });

    it('should use correct filename', async () => {
      const recoveryFile = new Uint8Array(32);
      const filename = 'custom-recovery-file.pkarr';

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
        remove: vi.fn(),
      };

      vi.mocked(document.createElement).mockReturnValue(mockLink as unknown as HTMLAnchorElement);

      await Identity.handleDownloadRecoveryFile({
        recoveryFile,
        filename,
      });

      expect(mockLink.download).toBe(filename);
    });
  });

  describe('keypairFromSecretKey', () => {
    it('should create keypair from valid secret key', () => {
      const secretKey = new Uint8Array(32).fill(1); // valid 32-byte array

      const result = Identity.keypairFromSecretKey(secretKey);

      expect(result).toBeDefined();
      expect(result.publicKey).toBeDefined();
      expect(result.secretKey).toBeDefined();
    });

    it('should throw error for invalid secret key length', () => {
      const invalidSecretKey = new Uint8Array(16); // Invalid length

      expect(() => Identity.keypairFromSecretKey(invalidSecretKey)).toThrow();
    });

    it('should throw CommonError with proper error type for invalid secret key', () => {
      const invalidSecretKey = new Uint8Array(16); // Invalid length

      try {
        Identity.keypairFromSecretKey(invalidSecretKey);
      } catch (error) {
        expect(error).toHaveProperty('type', CommonErrorType.INVALID_INPUT);
        expect(error).toHaveProperty('statusCode', 400);
      }
    });
  });
});
