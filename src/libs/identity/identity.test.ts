import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Identity } from './identity';
import { createRecoveryFile } from '@synonymdev/pubky';
import * as bip39 from 'bip39';
import { CommonErrorType } from '@/libs';

// Mock @synonymdev/pubky
vi.mock('@synonymdev/pubky', () => ({
  Keypair: {
    fromSecretKey: vi.fn(() => ({
      pubky: vi.fn(() => ({ z32: () => 'test-public-key' })),
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
    it('should generate valid BIP39 seed words', () => {
      const result = Identity.generateSeedWords();

      expect(result).toHaveLength(12);
      expect(result.every((word) => typeof word === 'string' && word.length > 0)).toBe(true);

      // Verify the generated mnemonic is valid
      const mnemonic = result.join(' ');
      expect(bip39.validateMnemonic(mnemonic)).toBe(true);
    });

    it('should generate different seed words on each call', () => {
      const result1 = Identity.generateSeedWords();
      const result2 = Identity.generateSeedWords();

      // Should generate different mnemonics (very unlikely to be the same)
      expect(result1.join(' ')).not.toBe(result2.join(' '));
    });

    it('should generate exactly 12 words', () => {
      const result = Identity.generateSeedWords();
      expect(result).toHaveLength(12);
    });

    it('should throw CommonError if BIP39 generation fails', () => {
      // Mock bip39.generateMnemonic to throw
      const mockGenerateMnemonic = vi.spyOn(bip39, 'generateMnemonic').mockImplementation(() => {
        throw new Error('BIP39 generation failed');
      });

      expect(() => Identity.generateSeedWords()).toThrow();

      mockGenerateMnemonic.mockRestore();
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

      // Mock Blob constructor
      const MockBlobConstructor = vi.fn(function (
        this: { content: BlobPart[]; options: BlobPropertyBag },
        content: BlobPart[],
        options: BlobPropertyBag,
      ) {
        this.content = content;
        this.options = options;
      });
      Object.defineProperty(global, 'Blob', {
        value: MockBlobConstructor,
        writable: true,
      });
    });

    it('should create recovery file successfully with valid keypair', async () => {
      const secretKey = new Uint8Array(32);
      crypto.getRandomValues(secretKey);

      const keypair = {
        pubky: 'test-public-key',
        secretKey: Buffer.from(secretKey).toString('hex'),
      };

      await expect(Identity.createRecoveryFile(keypair, 'password123')).resolves.not.toThrow();

      // Verify that the download process was initiated
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('should throw error for invalid secret key format', async () => {
      const keypair = {
        pubky: 'test-public-key',
        secretKey: 'invalid',
      };

      await expect(Identity.createRecoveryFile(keypair, 'password123')).rejects.toThrow();
    });

    it('should throw error for null secret key', async () => {
      const keypair = {
        pubky: 'test-public-key',
        secretKey: null as unknown as string,
      };

      await expect(Identity.createRecoveryFile(keypair, 'password123')).rejects.toThrow();
    });

    it('should throw error for incorrect secret key length', async () => {
      const shortKey = new Uint8Array(16);
      const keypair = {
        pubky: 'test-public-key',
        secretKey: Buffer.from(shortKey).toString('hex'),
      };

      await expect(Identity.createRecoveryFile(keypair, 'password123')).rejects.toThrow();
    });

    it('should throw CommonError with proper error type for invalid secret key', async () => {
      const keypair = {
        pubky: 'test-public-key',
        secretKey: null as unknown as string,
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
        pubky: 'test-public-key',
        secretKey: Buffer.from(shortKey).toString('hex'),
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
        pubky: 'test-public-key',
        secretKey: Buffer.from(secretKey).toString('hex'),
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

      // Mock Blob constructor
      const MockBlobConstructor = vi.fn(function (
        this: { content: BlobPart[]; options: BlobPropertyBag },
        content: BlobPart[],
        options: BlobPropertyBag,
      ) {
        this.content = content;
        this.options = options;
      });
      Object.defineProperty(global, 'Blob', {
        value: MockBlobConstructor,
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

      // Verify the download process - function converts Uint8Array to ArrayBuffer internally
      expect(global.Blob).toHaveBeenCalledWith([expect.any(ArrayBuffer)], { type: 'application/octet-stream' });
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Mock Blob to throw an error
      const FailingBlobConstructor = vi.fn(function (this: object) {
        throw new Error('Blob creation failed');
      });
      Object.defineProperty(global, 'Blob', {
        value: FailingBlobConstructor,
        writable: true,
      });

      await expect(
        Identity.handleDownloadRecoveryFile({
          recoveryFile: new Uint8Array(0),
          filename: 'test.pkarr',
        }),
      ).rejects.toThrow('Failed to download recovery file');
    });

    it('should handle empty recovery file', async () => {
      await expect(
        Identity.handleDownloadRecoveryFile({
          recoveryFile: new Uint8Array(0),
          filename: 'test.pkarr',
        }),
      ).resolves.not.toThrow();

      expect(global.Blob).toHaveBeenCalledWith([expect.any(ArrayBuffer)], { type: 'application/octet-stream' });
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

      const result = Identity.keypairFromSecretKey(Buffer.from(secretKey).toString('hex'));

      expect(result).toBeDefined();
      expect(result.pubky).toBeDefined();
      expect(result.secretKey).toBeDefined();
    });

    it('should throw error for invalid secret key length', () => {
      const invalidSecretKey = new Uint8Array(16); // Invalid length

      expect(() => Identity.keypairFromSecretKey(Buffer.from(invalidSecretKey).toString('hex'))).toThrow();
    });

    it('should throw CommonError with proper error type for invalid secret key', () => {
      const invalidSecretKey = new Uint8Array(16); // Invalid length

      try {
        Identity.keypairFromSecretKey(Buffer.from(invalidSecretKey).toString('hex'));
      } catch (error) {
        expect(error).toHaveProperty('type', CommonErrorType.INVALID_INPUT);
        expect(error).toHaveProperty('statusCode', 400);
      }
    });
  });

  describe('generateKeypair', () => {
    it('should generate a keypair with mnemonic using BIP39 strategy', () => {
      const result = Identity.generateKeypair();

      expect(result).toBeDefined();
      expect(result.pubky).toBeDefined();
      expect(result.secretKey).toBeDefined();
      expect(result.mnemonic).toBeDefined();
      expect(typeof result.pubky).toBe('string');
      expect(typeof result.secretKey).toBe('string');
      expect(typeof result.mnemonic).toBe('string');
      expect(result.secretKey).toHaveLength(64); // 32 bytes in hex

      // Verify mnemonic is valid BIP39
      expect(bip39.validateMnemonic(result.mnemonic)).toBe(true);

      // Verify mnemonic has 12 words
      const words = result.mnemonic.split(' ');
      expect(words).toHaveLength(12);
    });

    it('should generate different keypairs on each call', () => {
      const result1 = Identity.generateKeypair();
      const result2 = Identity.generateKeypair();

      expect(result1.pubky).not.toBe(result2.pubky);
      expect(result1.secretKey).not.toBe(result2.secretKey);
      expect(result1.mnemonic).not.toBe(result2.mnemonic);
    });

    it('should generate keypair that is consistent with mnemonic', () => {
      const result = Identity.generateKeypair();

      // Generate keypair from the mnemonic
      const keypairFromMnemonic = Identity.generateKeypairFromMnemonic(result.mnemonic);

      // Should match the original
      expect(result.pubky).toBe(keypairFromMnemonic.pubky);
      expect(result.secretKey).toBe(keypairFromMnemonic.secretKey);
    });
  });

  describe('generateKeypairFromMnemonic', () => {
    it('should generate a valid keypair from mnemonic', () => {
      // Generate a mnemonic
      const seedWords = Identity.generateSeedWords();
      const mnemonic = seedWords.join(' ');

      const keypair = Identity.generateKeypairFromMnemonic(mnemonic);

      expect(keypair).toBeDefined();
      expect(keypair.pubky).toBeDefined();
      expect(keypair.secretKey).toBeDefined();
      expect(typeof keypair.pubky).toBe('string');
      expect(typeof keypair.secretKey).toBe('string');
      expect(keypair.secretKey).toHaveLength(64); // 32 bytes in hex
    });

    it('should throw error for invalid mnemonic', () => {
      const invalidMnemonic = 'invalid mnemonic phrase test';

      expect(() => Identity.generateKeypairFromMnemonic(invalidMnemonic)).toThrow();
    });

    it('should generate consistent keypairs for same mnemonic', () => {
      // Generate a mnemonic
      const seedWords = Identity.generateSeedWords();
      const mnemonic = seedWords.join(' ');

      const keypair1 = Identity.generateKeypairFromMnemonic(mnemonic);
      const keypair2 = Identity.generateKeypairFromMnemonic(mnemonic);

      expect(keypair1.pubky).toBe(keypair2.pubky);
      expect(keypair1.secretKey).toBe(keypair2.secretKey);
    });
  });

  describe('seed phrase consistency', () => {
    it('should restore a valid keypair from generated seed words', () => {
      // Generate seed words
      const seedWords = Identity.generateSeedWords();
      const mnemonic = seedWords.join(' ');

      // Generate keypair from mnemonic
      const keypair = Identity.generateKeypairFromMnemonic(mnemonic);

      // Restore keypair using pubkyKeypairFromMnemonic
      const restoredKeypair = Identity.pubkyKeypairFromMnemonic(mnemonic);
      const restoredPubKy = restoredKeypair.publicKey().z32();

      // The restored keypair should be valid and match
      expect(restoredPubKy).toBeDefined();
      expect(typeof restoredPubKy).toBe('string');
      expect(restoredPubKy.length).toBeGreaterThan(0);
      expect(restoredPubKy).toBe(keypair.pubky);
    });

    it('should have consistent restore process', () => {
      // Generate seed words
      const seedWords = Identity.generateSeedWords();
      const mnemonic = seedWords.join(' ');

      // Restore keypair multiple times
      const restoredKeypair1 = Identity.pubkyKeypairFromMnemonic(mnemonic);
      const restoredPubKy1 = restoredKeypair1.publicKey().z32();

      const restoredKeypair2 = Identity.pubkyKeypairFromMnemonic(mnemonic);
      const restoredPubKy2 = restoredKeypair2.publicKey().z32();

      // Both restorations should produce the same result
      expect(restoredPubKy1).toBe(restoredPubKy2);
    });
  });
});
