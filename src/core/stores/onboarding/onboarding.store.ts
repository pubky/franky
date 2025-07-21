import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { type OnboardingStore, onboardingInitialState } from './onboarding.types';
import { createOnboardingActions } from './onboarding.actions';

// Store creation
export const useOnboardingStore = create<OnboardingStore>()(
  devtools(
    persist(
      (set) => ({
        ...onboardingInitialState,
        ...createOnboardingActions(set),
      }),
      {
        name: 'onboarding-storage',

        // Persist keys data
        partialize: (state) => ({
          isBackedUp: state.isBackedUp,
          publicKey: state.publicKey,
          secretKey: state.secretKey,
          hasHydrated: false, // Will be set by rehydration handler
        }),
      },
    ),
    {
      name: 'onboarding-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);
