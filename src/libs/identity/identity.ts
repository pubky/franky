import { Keypair, Keypair as PubkyKeypair, createRecoveryFile, decryptRecoveryFile } from '@synonymdev/pubky';
import * as bip39 from 'bip39';

import * as Libs from '@/libs';
import * as Core from '@/core';

export class Identity {
  static async createRecoveryFile(keypair: Core.TKeyPair | PubkyKeypair, password: string): Promise<void> {
    // Handle both string and Uint8Array secret keys for backward compatibility
    let secretKeyHex: string;

    if (keypair.secretKey instanceof Uint8Array) {
      // Convert Uint8Array to hex string
      if (keypair.secretKey.length !== 32) {
        throw Libs.createCommonError(
          Libs.CommonErrorType.INVALID_INPUT,
          `Invalid secret key length. Expected 32 bytes, got ${keypair.secretKey.length}. Please regenerate your keys.`,
          400,
          { secretKeyLength: keypair.secretKey.length },
        );
      }
      secretKeyHex = this.secretKeyToHex(keypair.secretKey);
    } else if (typeof keypair.secretKey === 'string') {
      // Validate hex string format
      if (keypair.secretKey.length !== 64) {
        throw Libs.createCommonError(
          Libs.CommonErrorType.INVALID_INPUT,
          `Invalid secret key length. Expected 64 hex characters, got ${keypair.secretKey.length}. Please regenerate your keys.`,
          400,
          { secretKeyLength: keypair.secretKey.length },
        );
      }
      secretKeyHex = keypair.secretKey;
    } else {
      throw Libs.createCommonError(
        Libs.CommonErrorType.INVALID_INPUT,
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

      throw Libs.createCommonError(
        Libs.CommonErrorType.UNEXPECTED_ERROR,
        'Failed to create recovery file. Please try regenerating your keys.',
        500,
        { originalError: error instanceof Error ? error.message : 'Unknown error', error },
      );
    }
  }

  static async handleDownloadRecoveryFile({ recoveryFile, filename }: { recoveryFile: Uint8Array; filename: string }) {
    try {
      const arrayBuffer = new ArrayBuffer(recoveryFile.byteLength);
      new Uint8Array(arrayBuffer).set(recoveryFile);
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(link.href);
    } catch (error) {
      throw Libs.createCommonError(Libs.CommonErrorType.UNEXPECTED_ERROR, 'Failed to download recovery file', 500, {
        error,
      });
    }
  }

  static generateSeedWords(): string[] {
    try {
      // Generate 12-word mnemonic using BIP39 standard (128 bits entropy)
      const mnemonic = bip39.generateMnemonic(128);

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
      throw Libs.createCommonError(
        Libs.CommonErrorType.UNEXPECTED_ERROR,
        'Failed to generate BIP39 seed words. Please try regenerating your keys.',
        500,
        { originalError: error instanceof Error ? error.message : 'Unknown error', error },
      );
    }
  }

  static generateKeypairFromMnemonic(mnemonic: string) {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, 'Invalid mnemonic', 400);
    }

    try {
      // Convert mnemonic to seed using BIP39 standard
      const seedMnemonic = bip39.mnemonicToSeedSync(mnemonic);

      // Use first 32 bytes as secret key
      const secretKey = seedMnemonic.slice(0, 32);

      // Create keypair from secret key
      const keypair = Keypair.fromSecretKey(secretKey);

      return {
        secretKey: this.secretKeyToHex(keypair.secretKey()),
        pubky: keypair.publicKey().z32(),
      };
    } catch (error) {
      throw Libs.createCommonError(
        Libs.CommonErrorType.INVALID_INPUT,
        'Failed to generate keypair from mnemonic',
        400,
        { originalError: error instanceof Error ? error.message : 'Unknown error', error },
      );
    }
  }

  static keypairFromSecretKey(secretKey: string) {
    try {
      const secretKeyUint8Array = this.secretKeyFromHex(secretKey);
      const keypair = PubkyKeypair.fromSecretKey(secretKeyUint8Array);

      return {
        secretKey: this.secretKeyToHex(keypair.secretKey()),
        pubky: keypair.publicKey().z32(),
      };
    } catch (error) {
      throw Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, 'Invalid secret key format', 400, { error });
    }
  }

  static pubkyKeypairFromSecretKey(secretKey: string): PubkyKeypair {
    try {
      const secretKeyUint8Array = this.secretKeyFromHex(secretKey);
      return PubkyKeypair.fromSecretKey(secretKeyUint8Array);
    } catch (error) {
      throw Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, 'Invalid secret key format', 400, { error });
    }
  }

  static generateKeypair() {
    // Generate mnemonic first, then create keypair from it
    const words = this.generateSeedWords();
    const mnemonic = words.join(' ');
    const { secretKey, pubky } = this.generateKeypairFromMnemonic(mnemonic);

    return {
      secretKey,
      pubky,
      mnemonic,
    };
  }

  static secretKeyFromHex(secretKey: string) {
    try {
      return new Uint8Array(Buffer.from(secretKey, 'hex'));
    } catch (error) {
      throw Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, 'Invalid secret key format', 400, { error });
    }
  }

  static secretKeyToHex(secretKey: Uint8Array) {
    try {
      return Buffer.from(secretKey).toString('hex');
    } catch (error) {
      throw Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, 'Invalid secret key format', 400, { error });
    }
  }

  static pubkyKeypairFromMnemonic(mnemonic: string) {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, 'Invalid recovery phrase', 400);
    }

    try {
      // Convert mnemonic to seed using BIP39 standard
      const seedMnemonic = bip39.mnemonicToSeedSync(mnemonic);

      // Use first 32 bytes as secret key (same as signup process)
      const secretKey = seedMnemonic.slice(0, 32);

      return Keypair.fromSecretKey(secretKey);
    } catch (error) {
      throw Libs.createCommonError(
        Libs.CommonErrorType.INVALID_INPUT,
        'Failed to restore keypair from recovery phrase',
        400,
        { originalError: error instanceof Error ? error.message : 'Unknown error', error },
      );
    }
  }

  static async decryptRecoveryFile(encryptedFile: File, password: string) {
    const arrayBuffer = await encryptedFile.arrayBuffer();
    const recoveryFile = new Uint8Array(arrayBuffer);
    try {
      return decryptRecoveryFile(recoveryFile, password);
    } catch (error) {
      throw Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, 'Invalid recovery file or password', 400, {
        error,
      });
    }
  }

  /**
   * Extracts the public key from a pubky identifier string
   * Validates that the input matches the expected format and returns only the key portion
   *
   * @param pubky - The pubky identifier string (e.g., "pk:abc123..." or "pubkyabc123...")
   * @returns The 52-character public key portion, or null if the format is invalid
   *
   * @example
   * Identity.extractPubkyPublicKey("pk:abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnop") // "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnop"
   * Identity.extractPubkyPublicKey("pubkyabcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnop") // "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnop"
   * Identity.extractPubkyPublicKey("invalid") // null
   */
  static extractPubkyPublicKey(pubky: string): string | null {
    if (!pubky || typeof pubky !== 'string') {
      return null;
    }

    // Pattern for 52 lowercase alphanumeric characters
    const keyPattern = /^[a-z0-9]{52}$/;

    // Check for "pk:" prefix
    if (pubky.startsWith('pk:')) {
      const key = pubky.slice(3);
      return keyPattern.test(key) ? key : null;
    }

    // Check for "pubky" prefix
    if (pubky.startsWith('pubky')) {
      const key = pubky.slice(5);
      return keyPattern.test(key) ? key : null;
    }

    return null;
  }
}
