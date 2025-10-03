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
          pubky: state.pubky,
          secretKey: state.secretKey,
          mnemonic: state.mnemonic,
          showWelcomeDialog: state.showWelcomeDialog,
          hasHydrated: false, // Will be set by rehydration handler
        }),

        // Set hasHydrated to true after rehydration
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.setHydrated(true);
          }
        },
      },
    ),
    {
      name: 'onboarding-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);
