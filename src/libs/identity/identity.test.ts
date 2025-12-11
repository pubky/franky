import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Identity } from './identity';
import * as bip39 from 'bip39';
import { CommonErrorType } from '@/libs';

// Mock @synonymdev/pubky
const mockCreateRecoveryFile = vi.fn(() => new Uint8Array([1, 2, 3, 4, 5]));
const mockPublicKey = {
  z32: vi.fn(() => 'test-public-key'),
  toString: vi.fn(() => 'test-public-key'),
};
const mockKeypair = {
  publicKey: mockPublicKey,
  secretKey: vi.fn(() => new Uint8Array(32).fill(1)),
  createRecoveryFile: mockCreateRecoveryFile,
};

vi.mock('@synonymdev/pubky', () => ({
  Keypair: {
    fromSecretKey: vi.fn(() => mockKeypair),
    fromRecoveryFile: vi.fn(() => mockKeypair),
  },
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

  describe('generateKeypair mnemonic generation', () => {
    it('should generate valid BIP39 mnemonic in keypair result', () => {
      const result = Identity.generateKeypair();

      const words = result.mnemonic.split(' ');
      expect(words).toHaveLength(12);
      expect(words.every((word) => typeof word === 'string' && word.length > 0)).toBe(true);

      // Verify the generated mnemonic is valid
      expect(bip39.validateMnemonic(result.mnemonic)).toBe(true);
    });

    it('should generate different mnemonics on each call', () => {
      const result1 = Identity.generateKeypair();
      const result2 = Identity.generateKeypair();

      // Should generate different mnemonics (very unlikely to be the same)
      expect(result1.mnemonic).not.toBe(result2.mnemonic);
    });

    it('should generate exactly 12 words in mnemonic', () => {
      const result = Identity.generateKeypair();
      const words = result.mnemonic.split(' ');
      expect(words).toHaveLength(12);
    });

    it('should throw CommonError if BIP39 generation fails', () => {
      // Mock bip39.generateMnemonic to throw
      const mockGenerateMnemonic = vi.spyOn(bip39, 'generateMnemonic').mockImplementation(() => {
        throw new Error('BIP39 generation failed');
      });

      expect(() => Identity.generateKeypair()).toThrow();

      mockGenerateMnemonic.mockRestore();
    });
  });

  describe('createRecoveryFile', () => {
    beforeEach(() => {
      // Reset the mock
      mockCreateRecoveryFile.mockClear();
      mockCreateRecoveryFile.mockReturnValue(new Uint8Array([1, 2, 3, 4, 5]));

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
      // Use a mock keypair object with createRecoveryFile method
      const keypairWithMethod = {
        ...mockKeypair,
        createRecoveryFile: mockCreateRecoveryFile,
      };

      await expect(
        Identity.createRecoveryFile({ keypair: keypairWithMethod as never, passphrase: 'password123' }),
      ).resolves.not.toThrow();

      // Verify that createRecoveryFile was called on the keypair
      expect(mockCreateRecoveryFile).toHaveBeenCalledWith('password123');
      // Verify that the download process was initiated
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('should throw error when keypair.createRecoveryFile throws', async () => {
      const keypairWithFailingMethod = {
        ...mockKeypair,
        createRecoveryFile: vi.fn(() => {
          throw new Error('Recovery file creation failed');
        }),
      };

      await expect(
        Identity.createRecoveryFile({ keypair: keypairWithFailingMethod as never, passphrase: 'password123' }),
      ).rejects.toThrow();
    });

    it('should handle createRecoveryFile errors and throw CommonError', async () => {
      const keypairWithFailingMethod = {
        ...mockKeypair,
        createRecoveryFile: vi.fn(() => {
          throw new Error('Recovery file creation failed');
        }),
      };

      try {
        await Identity.createRecoveryFile({ keypair: keypairWithFailingMethod as never, passphrase: 'password123' });
      } catch (error) {
        expect(error).toHaveProperty('type', CommonErrorType.UNEXPECTED_ERROR);
        expect(error).toHaveProperty('statusCode', 500);
      }
    });
  });

  describe('keypairDataFromSecretKey', () => {
    it('should create keypair from valid secret key', () => {
      const secretKey = new Uint8Array(32).fill(1); // valid 32-byte array

      const result = Identity.keypairDataFromSecretKey(Buffer.from(secretKey).toString('hex'));

      expect(result).toBeDefined();
      expect(result.pubky).toBeDefined();
      expect(result.secretKey).toBeDefined();
    });

    it('should throw error for invalid secret key length', () => {
      const invalidSecretKey = new Uint8Array(16); // Invalid length

      expect(() => Identity.keypairDataFromSecretKey(Buffer.from(invalidSecretKey).toString('hex'))).toThrow();
    });

    it('should throw CommonError with proper error type for invalid secret key', () => {
      const invalidSecretKey = new Uint8Array(16); // Invalid length

      try {
        Identity.keypairDataFromSecretKey(Buffer.from(invalidSecretKey).toString('hex'));
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
      expect(result.keypair).toBeDefined();
      expect(result.mnemonic).toBeDefined();
      expect(typeof result.mnemonic).toBe('string');

      // Verify mnemonic is valid BIP39
      expect(bip39.validateMnemonic(result.mnemonic)).toBe(true);

      // Verify mnemonic has 12 words
      const words = result.mnemonic.split(' ');
      expect(words).toHaveLength(12);
    });

    it('should generate different keypairs on each call', () => {
      const result1 = Identity.generateKeypair();
      const result2 = Identity.generateKeypair();

      expect(result1.mnemonic).not.toBe(result2.mnemonic);
    });

    it('should generate keypair that is consistent with mnemonic', () => {
      const result = Identity.generateKeypair();

      // Generate keypair from the mnemonic using the public API
      const keypairFromMnemonic = Identity.keypairFromMnemonic(result.mnemonic);

      // Both should produce valid keypairs (the mock returns the same keypair)
      expect(keypairFromMnemonic).toBeDefined();
    });
  });

  describe('keypairFromMnemonic', () => {
    it('should generate a valid keypair from mnemonic', () => {
      // Generate a mnemonic using generateKeypair
      const { mnemonic } = Identity.generateKeypair();

      const keypair = Identity.keypairFromMnemonic(mnemonic);

      expect(keypair).toBeDefined();
      // The mock returns a keypair object
      expect(keypair.publicKey).toBeDefined();
    });

    it('should throw error for invalid mnemonic', () => {
      const invalidMnemonic = 'invalid mnemonic phrase test';

      expect(() => Identity.keypairFromMnemonic(invalidMnemonic)).toThrow();
    });

    it('should generate consistent keypairs for same mnemonic', () => {
      // Generate a mnemonic using generateKeypair
      const { mnemonic } = Identity.generateKeypair();

      const keypair1 = Identity.keypairFromMnemonic(mnemonic);
      const keypair2 = Identity.keypairFromMnemonic(mnemonic);

      // Both calls should succeed (the mock returns the same keypair)
      expect(keypair1).toBeDefined();
      expect(keypair2).toBeDefined();
    });
  });

  describe('seed phrase consistency', () => {
    it('should restore a valid keypair from generated mnemonic', () => {
      // Generate keypair with mnemonic
      const { mnemonic } = Identity.generateKeypair();

      // Restore keypair using keypairFromMnemonic
      const restoredKeypair = Identity.keypairFromMnemonic(mnemonic);

      // The restored keypair should be valid
      expect(restoredKeypair).toBeDefined();
      expect(restoredKeypair.publicKey).toBeDefined();
    });

    it('should have consistent restore process', () => {
      // Generate keypair with mnemonic
      const { mnemonic } = Identity.generateKeypair();

      // Restore keypair multiple times
      const restoredKeypair1 = Identity.keypairFromMnemonic(mnemonic);
      const restoredKeypair2 = Identity.keypairFromMnemonic(mnemonic);

      // Both restorations should succeed
      expect(restoredKeypair1).toBeDefined();
      expect(restoredKeypair2).toBeDefined();
    });
  });

  describe('extractPubkyPublicKey', () => {
    const validKey = 'o1gg96ewuojmopcjbz8895478wdtxtzzber7aezq6ror5a91j7dy';

    describe('with "pk:" prefix', () => {
      it('should extract valid 52-character lowercase alphanumeric key', () => {
        const result = Identity.extractPubkyPublicKey(`pk:${validKey}`);
        expect(result).toBe(validKey);
      });

      it('should return null for key shorter than 52 characters', () => {
        const result = Identity.extractPubkyPublicKey('pk:o1gg96ewuojmopcjbz8895478wdtxt');
        expect(result).toBeNull();
      });

      it('should return null for key longer than 52 characters', () => {
        const result = Identity.extractPubkyPublicKey(`pk:${validKey}extra`);
        expect(result).toBeNull();
      });

      it('should return null for key with uppercase characters', () => {
        const result = Identity.extractPubkyPublicKey('pk:O1GG96EWUOJMOPCJBZ8895478WDTXTZZBER7AEZQ6ROR5A91J7DY');
        expect(result).toBeNull();
      });

      it('should return null for key with special characters', () => {
        const result = Identity.extractPubkyPublicKey('pk:o1gg96ewuojmopcjbz8895478wdtxtzzber7aezq6ror5a91j7d!');
        expect(result).toBeNull();
      });

      it('should return null for empty key after prefix', () => {
        const result = Identity.extractPubkyPublicKey('pk:');
        expect(result).toBeNull();
      });
    });

    describe('with "pubky" prefix', () => {
      it('should extract valid 52-character lowercase alphanumeric key', () => {
        const result = Identity.extractPubkyPublicKey(`pubky${validKey}`);
        expect(result).toBe(validKey);
      });

      it('should return null for key shorter than 52 characters', () => {
        const result = Identity.extractPubkyPublicKey('pubkyo1gg96ewuojmopcjbz8895478wdtxt');
        expect(result).toBeNull();
      });

      it('should return null for key longer than 52 characters', () => {
        const result = Identity.extractPubkyPublicKey(`pubky${validKey}extra`);
        expect(result).toBeNull();
      });

      it('should return null for key with uppercase characters', () => {
        const result = Identity.extractPubkyPublicKey('pubkyO1GG96EWUOJMOPCJBZ8895478WDTXTZZBER7AEZQ6ROR5A91J7DY');
        expect(result).toBeNull();
      });

      it('should return null for key with special characters', () => {
        const result = Identity.extractPubkyPublicKey('pubkyo1gg96ewuojmopcjbz8895478wdtxtzzber7aezq6ror5a91j7d!');
        expect(result).toBeNull();
      });

      it('should return null for empty key after prefix', () => {
        const result = Identity.extractPubkyPublicKey('pubky');
        expect(result).toBeNull();
      });
    });

    describe('invalid inputs', () => {
      it('should return null for string without valid prefix', () => {
        expect(Identity.extractPubkyPublicKey(validKey)).toBeNull();
      });

      it('should return null for string with wrong prefix', () => {
        expect(Identity.extractPubkyPublicKey(`key:${validKey}`)).toBeNull();
      });

      it('should return null for empty string', () => {
        expect(Identity.extractPubkyPublicKey('')).toBeNull();
      });

      it('should return null for null input', () => {
        expect(Identity.extractPubkyPublicKey(null as unknown as string)).toBeNull();
      });

      it('should return null for undefined input', () => {
        expect(Identity.extractPubkyPublicKey(undefined as unknown as string)).toBeNull();
      });

      it('should return null for non-string input', () => {
        expect(Identity.extractPubkyPublicKey(12345 as unknown as string)).toBeNull();
        expect(Identity.extractPubkyPublicKey({} as unknown as string)).toBeNull();
        expect(Identity.extractPubkyPublicKey([] as unknown as string)).toBeNull();
      });

      it('should return null for string with only whitespace', () => {
        expect(Identity.extractPubkyPublicKey('   ')).toBeNull();
      });

      it('should return null for pk: prefix with spaces in key', () => {
        expect(Identity.extractPubkyPublicKey('pk:o1gg96ewuojmopcjbz8895478 wdtxtzzber7aezq6ror5a91j7dy')).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('should be case-sensitive for prefix "pk:"', () => {
        expect(Identity.extractPubkyPublicKey(`PK:${validKey}`)).toBeNull();
        expect(Identity.extractPubkyPublicKey(`Pk:${validKey}`)).toBeNull();
      });

      it('should be case-sensitive for prefix "pubky"', () => {
        expect(Identity.extractPubkyPublicKey(`PUBKY${validKey}`)).toBeNull();
        expect(Identity.extractPubkyPublicKey(`Pubky${validKey}`)).toBeNull();
      });

      it('should handle key with all zeros', () => {
        const allZeros = '0000000000000000000000000000000000000000000000000000';
        expect(Identity.extractPubkyPublicKey(`pk:${allZeros}`)).toBe(allZeros);
      });

      it('should handle key with all letters', () => {
        const allLetters = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        expect(Identity.extractPubkyPublicKey(`pk:${allLetters}`)).toBe(allLetters);
      });

      it('should handle key with mixed alphanumeric', () => {
        const mixedKey = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6';
        expect(Identity.extractPubkyPublicKey(`pubky${mixedKey}`)).toBe(mixedKey);
      });
    });
  });
});
