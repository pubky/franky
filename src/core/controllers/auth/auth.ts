import { Keypair, createRecoveryFile } from '@synonymdev/pubky';
import * as bip39 from 'bip39';
import crypto from 'crypto';
import {
  type UserControllerNewData,
  type UserModelSchema,
  type SignupResult,
  HomeserverService,
  UserController,
  DEFAULT_NEW_USER,
  DEFAULT_USER_DETAILS,
  KeyPair,
} from '@/core';
import { Env, CommonErrorType, createCommonError, Logger } from '@/libs';

export class AuthController {
  private constructor() {} // Prevent instantiation

  static async signUp(
    newUser: UserControllerNewData,
    // signupToken?: string TODO: remove this once we have a proper signup token endpoint
  ): Promise<SignupResult> {
    const homeserverService = HomeserverService.getInstance();

    // Generate keypair
    const keypair = homeserverService.generateRandomKeypair();

    // Generate signup token
    // TODO: remove this once we have a proper signup token endpoint
    const signupToken = await this.generateSignupToken();

    // Save user to database and update sync_status = 'local'
    const id = keypair.publicKey().z32();
    const userData: UserModelSchema = {
      id,
      details: {
        id,
        ...DEFAULT_USER_DETAILS,
        ...newUser,
      },
      ...DEFAULT_NEW_USER,
    };

    // save user to database
    const user = await UserController.insert(userData);

    // Sign up
    const signupResult = await homeserverService.signup(user, keypair, signupToken);

    // update user sync_status = 'homeserver'
    user.sync_status = 'homeserver';
    await user.save();

    return signupResult;
  }

  static async getKeypair(): Promise<Keypair | null> {
    const homeserverService = HomeserverService.getInstance();
    return homeserverService.getCurrentKeypair();
  }

  static async logout(): Promise<void> {
    const homeserverService = HomeserverService.getInstance();
    const keypair = homeserverService.getCurrentKeypair();
    if (!keypair) {
      throw createCommonError(CommonErrorType.INVALID_INPUT, 'No keypair available', 400);
    }
    return homeserverService.logout(keypair.publicKey().z32());
  }

  // TODO: remove this once we have a proper signup token endpoint
  private static async generateSignupToken(): Promise<string> {
    const endpoint = Env.NEXT_PUBLIC_HOMESERVER_ADMIN_URL;
    const password = Env.NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD;

    if (!endpoint || !password) {
      throw createCommonError(
        CommonErrorType.INVALID_INPUT,
        'Missing required environment variables: NEXT_PUBLIC_HOMESERVER_ADMIN_URL or NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD',
        400,
      );
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-Admin-Password': password,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw createCommonError(
        CommonErrorType.NETWORK_ERROR,
        `Failed to generate signup token: ${response.status} ${errorText}`,
        response.status,
      );
    }

    const token = (await response.text()).trim();
    if (!token) {
      throw createCommonError(CommonErrorType.UNEXPECTED_ERROR, 'No token received from server', 500);
    }

    return token;
  }

  static async createRecoveryFile(keypair: KeyPair, password: string): Promise<void> {
    // Validate secret key format
    if (!keypair.secretKey || !(keypair.secretKey instanceof Uint8Array)) {
      throw createCommonError(
        CommonErrorType.INVALID_INPUT,
        'Invalid secret key format. Please regenerate your keys.',
        400,
        { secretKeyType: typeof keypair.secretKey },
      );
    }

    if (keypair.secretKey.length !== 32) {
      throw createCommonError(
        CommonErrorType.INVALID_INPUT,
        `Invalid secret key length. Expected 32 bytes, got ${keypair.secretKey.length}. Please regenerate your keys.`,
        400,
        { secretKeyLength: keypair.secretKey.length },
      );
    }

    try {
      const keypairFromSecretKey = Keypair.fromSecretKey(keypair.secretKey);
      const recoveryFile = createRecoveryFile(keypairFromSecretKey, password);
      this.handleDownloadRecoveryFile({ recoveryFile, filename: 'recovery.pkarr' });
    } catch (error) {
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

  static generateSeedWords(secretKey: Uint8Array | unknown): string[] {
    if (!secretKey || !(secretKey instanceof Uint8Array)) {
      Logger.warn('AuthController: No secret key available for seed generation', {
        hasSecretKey: !!secretKey,
        isValidSecretKey: secretKey instanceof Uint8Array,
      });
      throw createCommonError(
        CommonErrorType.INVALID_INPUT,
        'Invalid secret key format. Please regenerate your keys.',
        400,
        { secretKeyType: typeof secretKey },
      );
    }

    try {
      Logger.info('AuthController: Generating BIP39 seed words from secret key');

      // Convert secret key to buffer (secretKey is already a Uint8Array)
      const secretBuffer = Buffer.from(secretKey);

      // Validate minimum length (should be at least 32 bytes for good entropy)
      if (secretBuffer.length < 32) {
        Logger.warn('AuthController: Secret key is shorter than recommended 32 bytes', {
          actualLength: secretBuffer.length,
        });
      }

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

      Logger.info('AuthController: Successfully generated BIP39 seed words', {
        wordCount: words.length,
        secretKeyLength: secretKey.length,
        isValidMnemonic: bip39.validateMnemonic(mnemonic),
      });

      return words;
    } catch (error) {
      Logger.error('AuthController: Failed to generate BIP39 seed words', error);
      throw createCommonError(
        CommonErrorType.UNEXPECTED_ERROR,
        'Failed to generate BIP39 seed words. Please try regenerating your keys.',
        500,
        { originalError: error instanceof Error ? error.message : 'Unknown error' },
      );
    }
  }
}
