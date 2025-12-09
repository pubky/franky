import { OnboardingStore } from './onboarding.types';
import { ZustandGet } from '../stores.types';
import * as Libs from '@/libs';

export const createOnboardingSelectors = (get: ZustandGet<OnboardingStore>) => ({
  /**
   * Gets the secret key (private key) from the keypair
   * @returns The secret key as a hex string
   * @throws Error if keypair is not available
   */
  selectSecretKey: () => {
    const keypair = get().keypair;
    if (!keypair) {
        // TODO: Specific error type
      throw new Error('Keypair is not available. Please generate a keypair first.');
    }
    return Libs.Identity.secretKeyToHex(keypair.secretKey());
  },

  /**
   * Gets the public key (pubky) from the keypair
   * @returns The public key as a string
   * @throws Error if keypair is not available
   */
  selectPublicKey: () => {
    const keypair = get().keypair;
    if (!keypair) {
        // TODO: Specific error type
      throw new Error('Keypair is not available. Please generate a keypair first.');
    }
    return keypair.publicKey.z32();
  },

  /**
   * Gets the mnemonic recovery phrase
   * @returns The mnemonic as a string
   * @throws Error if mnemonic is not available
   */
  selectMnemonic: () => {
    const mnemonic = get().mnemonic;
    if (!mnemonic) {
        // TODO: Specific error type
      throw new Error('Mnemonic is not available. Please generate a keypair first.');
    }
    return mnemonic;
  },
});
