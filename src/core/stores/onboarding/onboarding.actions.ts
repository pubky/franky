import {
  type OnboardingStore,
  type OnboardingActions,
  onboardingInitialState,
  OnboardingActionTypes,
} from './onboarding.types';
import { ZustandGet, type ZustandSet } from '../stores.types';
import { Keypair } from '@synonymdev/pubky';

export const createOnboardingActions = (set: ZustandSet<OnboardingStore>, get: ZustandGet<OnboardingStore>): OnboardingActions => ({
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

  setKeypair: (keypair: Keypair) => {
    set({ keypair }, false, OnboardingActionTypes.SET_KEYPAIR);
  },

  setMnemonic: (mnemonic: string) => {
    set({ mnemonic }, false, OnboardingActionTypes.SET_MNEMONIC);
  },

  clearSecrets: () => {
    set({ keypair: null, mnemonic: null }, false, OnboardingActionTypes.CLEAR_SECRETS);
  },

  setHydrated: (hasHydrated: boolean) => {
    set({ hasHydrated }, false, OnboardingActionTypes.SET_HYDRATED);
  },

  setShowWelcomeDialog: (showWelcomeDialog: boolean) => {
    set({ showWelcomeDialog }, false, OnboardingActionTypes.SET_SHOW_WELCOME_DIALOG);
  },
});
