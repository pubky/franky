import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { AuthStore, authInitialState } from './auth.types';
import { createAuthActions } from './auth.actions';
import { createAuthSelectors } from './auth.selectors';

// Store creation
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...authInitialState,
        ...createAuthActions(set),
        ...createAuthSelectors(get),
      }),
      {
        name: 'auth-store',
        // Only persist essential data
        partialize: (state) => ({
          currentUserPubky: state.currentUserPubky,
          session: state.session,
          hasProfile: state.hasProfile,
          hasHydrated: false, // Will be set by rehydration handler
        }),

        // Set hasHydrated to true after rehydration
        onRehydrateStorage: () => (state) => {
          console.log('🔵 AUTH STORE: onRehydrateStorage called', { state: !!state, hasHydrated: state?.hasHydrated });
          if (state) {
            state.setHasHydrated(true);
            console.log('🟢 AUTH STORE: setHasHydrated(true) called', { hasHydrated: state.hasHydrated });
          }
        },
      },
    ),
    {
      name: 'auth-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);
