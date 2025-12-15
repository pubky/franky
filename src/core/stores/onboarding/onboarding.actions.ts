import {
  type OnboardingStore,
  type OnboardingActions,
  onboardingInitialState,
  OnboardingActionTypes,
  TOnboardingSecrets,
} from './onboarding.types';
import { type ZustandSet } from '../stores.types';

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

  setSecrets: (secrets: TOnboardingSecrets) => {
    set({ ...secrets }, false, OnboardingActionTypes.SET_SECRETS);
  },

  clearSecrets: () => {
    set({ secretKey: null, mnemonic: null }, false, OnboardingActionTypes.CLEAR_SECRETS);
  },

  setHydrated: (hasHydrated: boolean) => {
    set({ hasHydrated }, false, OnboardingActionTypes.SET_HYDRATED);
  },

  setShowWelcomeDialog: (showWelcomeDialog: boolean) => {
    set({ showWelcomeDialog }, false, OnboardingActionTypes.SET_SHOW_WELCOME_DIALOG);
  },
});
