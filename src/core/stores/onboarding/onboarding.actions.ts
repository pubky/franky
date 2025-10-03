import {
  type OnboardingStore,
  type OnboardingActions,
  onboardingInitialState,
  OnboardingActionTypes,
} from './onboarding.types';
import { type ZustandSet } from '../stores.types';
import * as Libs from '@/libs';
import * as Core from '@/core';

export const createOnboardingActions = (set: ZustandSet<OnboardingStore>): OnboardingActions => ({
  reset: () => {
    set(
      (state) => ({
        ...onboardingInitialState,
        hasHydrated: state.hasHydrated, // Preserve hydration state during reset
      }),
      false,
      OnboardingActionTypes.RESET,
    );
  },

  setSecretKey: (secretKey: string) => {
    set({ secretKey }, false, OnboardingActionTypes.SET_SECRET_KEY);
  },

  setPubky: (pubky: Core.Pubky) => {
    set({ pubky }, false, OnboardingActionTypes.SET_PUBKY);
  },

  setMnemonic: (mnemonic: string) => {
    set({ mnemonic }, false, OnboardingActionTypes.SET_MNEMONIC);
  },

  setKeypair: (pubky: Core.Pubky, secretKey: string) => {
    set({ pubky, secretKey }, false, OnboardingActionTypes.SET_KEYPAIR);
  },

  setKeypairFromMnemonic: (mnemonic: string) => {
    try {
      const keypair = Libs.Identity.generateKeypairFromMnemonic(mnemonic);
      set(
        {
          pubky: keypair.pubky,
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

  clearSecrets: () => {
    set({ secretKey: '', mnemonic: '' }, false, OnboardingActionTypes.CLEAR_SECRETS);
  },

  setHydrated: (hasHydrated: boolean) => {
    set({ hasHydrated }, false, OnboardingActionTypes.SET_HYDRATED);
  },
});
