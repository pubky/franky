import {
  type OnboardingStore,
  type OnboardingActions,
  onboardingInitialState,
  OnboardingActionTypes,
} from './onboarding.types';
import { type ZustandSet } from '../stores.types';
import * as Libs from '@/libs';

export const createOnboardingActions = (set: ZustandSet<OnboardingStore>): OnboardingActions => ({
  reset: () => {
    set(onboardingInitialState, false, OnboardingActionTypes.RESET);
  },

  setSecretKey: (secretKey: string) => {
    set({ secretKey }, false, OnboardingActionTypes.SET_SECRET_KEY);
  },

  setPublicKey: (publicKey: string) => {
    set({ publicKey }, false, OnboardingActionTypes.SET_PUBLIC_KEY);
  },

  setMnemonic: (mnemonic: string) => {
    set({ mnemonic }, false, OnboardingActionTypes.SET_MNEMONIC);
  },

  setKeypair: (publicKey: string, secretKey: string) => {
    set({ publicKey, secretKey }, false, OnboardingActionTypes.SET_KEYPAIR);
  },

  setKeypairFromMnemonic: (mnemonic: string) => {
    try {
      const keypair = Libs.Identity.generateKeypairFromMnemonic(mnemonic);
      set(
        {
          publicKey: keypair.publicKey,
          secretKey: keypair.secretKey,
          mnemonic,
        },
        false,
        OnboardingActionTypes.SET_KEYPAIR_FROM_MNEMONIC,
      );
    } catch (error) {
      console.error('Failed to generate keypair from mnemonic:', error);
      throw error;
    }
  },

  setHydrated: (hasHydrated: boolean) => {
    set({ hasHydrated }, false, OnboardingActionTypes.SET_HYDRATED);
  },
});
