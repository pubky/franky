import {
  type OnboardingStore,
  type OnboardingActions,
  onboardingInitialState,
  OnboardingActionTypes,
} from './onboarding.types';
import { type ZustandSet } from '../stores.types';

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

  setGenerating: (isGenerating: boolean) => {
    set({ isGenerating }, false, OnboardingActionTypes.SET_GENERATING);
  },

  setHydrated: (hasHydrated: boolean) => {
    set({ hasHydrated }, false, OnboardingActionTypes.SET_HYDRATED);
  },
});
