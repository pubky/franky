import { Keypair as PubkyKeypair, createRecoveryFile } from '@synonymdev/pubky';
import * as bip39 from 'bip39';
import crypto from 'crypto';
import { CommonErrorType, createCommonError } from '@/libs';
import { TKeyPair } from '@/core';

export class Identity {
  static async createRecoveryFile(
    keypair: TKeyPair | { publicKey: string; secretKey: Uint8Array },
    password: string,
  ): Promise<void> {
    // Handle both string and Uint8Array secret keys for backward compatibility
    let secretKeyHex: string;

    if (keypair.secretKey instanceof Uint8Array) {
      // Convert Uint8Array to hex string
      if (keypair.secretKey.length !== 32) {
        throw createCommonError(
          CommonErrorType.INVALID_INPUT,
          `Invalid secret key length. Expected 32 bytes, got ${keypair.secretKey.length}. Please regenerate your keys.`,
          400,
          { secretKeyLength: keypair.secretKey.length },
        );
      }
      secretKeyHex = this.secretKeyToHex(keypair.secretKey);
    } else if (typeof keypair.secretKey === 'string') {
      // Validate hex string format
      if (keypair.secretKey.length !== 64) {
        throw createCommonError(
          CommonErrorType.INVALID_INPUT,
          `Invalid secret key length. Expected 64 hex characters, got ${keypair.secretKey.length}. Please regenerate your keys.`,
          400,
          { secretKeyLength: keypair.secretKey.length },
        );
      }
      secretKeyHex = keypair.secretKey;
    } else {
      throw createCommonError(
        CommonErrorType.INVALID_INPUT,
        'Invalid secret key format. Please regenerate your keys.',
        400,
        { secretKeyType: typeof keypair.secretKey },
      );
    }

    try {
      const pubkyKeypair = this.pubkyKeypairFromSecretKey(secretKeyHex);
      const recoveryFile = createRecoveryFile(pubkyKeypair, password);
      this.handleDownloadRecoveryFile({ recoveryFile, filename: 'recovery.pkarr' });
    } catch (error) {
      // Re-throw validation errors
      if (error instanceof Error && error.message.includes('Invalid secret key')) {
        throw error;
      }

      throw createCommonError(
        CommonErrorType.UNEXPECTED_ERROR,
        'Failed to create recovery file. Please try regenerating your keys.',
        500,
        { originalError: error instanceof Error ? error.message : 'Unknown error' },
      );
    }
  }

  static async handleDownloadRecoveryFile({ recoveryFile, filename }: { recoveryFile: Uint8Array; filename: string }) {
    try {
      const blob = new Blob([recoveryFile], { type: 'application/octet-stream' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.log(error);
    }
  }

  static generateSeedWords(secretKey: string): string[] {
    // Convert secret key to buffer (secretKey is already a Uint8Array)
    const secretBuffer = this.secretKeyFromHex(secretKey);

    // Validate minimum length (should be at least 32 bytes for good entropy)
    if (secretBuffer.length < 32) {
      throw createCommonError(CommonErrorType.INVALID_INPUT, 'Secret key is shorter than recommended 32 bytes', 400, {
        actualLength: secretBuffer.length,
      });
    }

    try {
      // Create a hash of the secret key to use as entropy
      // This ensures we get consistent seed words from the same secret key
      const entropy = crypto.createHash('sha256').update(secretBuffer).digest();

      // Take first 128 bits (16 bytes) for 12-word mnemonic
      const entropy128 = entropy.slice(0, 16);

      // Generate mnemonic from entropy
      const mnemonic = bip39.entropyToMnemonic(entropy128);

      // Validate the generated mnemonic
      if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Generated mnemonic failed validation');
      }

      const words = mnemonic.split(' ');

      // Ensure we have exactly 12 words
      if (words.length !== 12) {
        throw new Error(`Expected 12 words, got ${words.length}`);
      }

      return words;
    } catch (error) {
      throw createCommonError(
        CommonErrorType.UNEXPECTED_ERROR,
        'Failed to generate BIP39 seed words. Please try regenerating your keys.',
        500,
        { originalError: error instanceof Error ? error.message : 'Unknown error' },
      );
    }
  }

  static keypairFromSecretKey(secretKey: string): TKeyPair {
    try {
      const secretKeyUint8Array = this.secretKeyFromHex(secretKey);
      const keypair = PubkyKeypair.fromSecretKey(secretKeyUint8Array);

      return {
        secretKey: this.secretKeyToHex(keypair.secretKey()),
        publicKey: keypair.publicKey().z32(),
      };
    } catch (error) {
      throw createCommonError(CommonErrorType.INVALID_INPUT, 'Invalid secret key format', 400, { error });
    }
  }

  static pubkyKeypairFromSecretKey(secretKey: string): PubkyKeypair {
    try {
      const secretKeyUint8Array = this.secretKeyFromHex(secretKey);
      const keypair = PubkyKeypair.fromSecretKey(secretKeyUint8Array);

      return keypair;
    } catch (error) {
      throw createCommonError(CommonErrorType.INVALID_INPUT, 'Invalid secret key format', 400, { error });
    }
  }

  static generateKeypair(): TKeyPair {
    const keypair = PubkyKeypair.random();
    const secretKey = this.secretKeyToHex(keypair.secretKey());
    const publicKey = keypair.publicKey().z32();

    return { secretKey, publicKey };
  }

  static secretKeyFromHex(secretKey: string): Uint8Array {
    try {
      return new Uint8Array(Buffer.from(secretKey, 'hex'));
    } catch (error) {
      throw createCommonError(CommonErrorType.INVALID_INPUT, 'Invalid secret key format', 400, { error });
    }
  }

  static secretKeyToHex(secretKey: Uint8Array): string {
    try {
      return Buffer.from(secretKey).toString('hex');
    } catch (error) {
      throw createCommonError(CommonErrorType.INVALID_INPUT, 'Invalid secret key format', 400, { error });
    }
  }
}
