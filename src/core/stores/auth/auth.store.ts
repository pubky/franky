import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { AuthStore, authInitialState } from './auth.types';
import { createAuthActions } from './auth';
import { createAuthSelectors } from './auth.selectors';
import { withStoreBenchmarking } from '@/core/stores/storeBenchmarking';

// Store creation
export const useAuthStore = create<AuthStore>()(
  withStoreBenchmarking<AuthStore>('auth-store')(
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
            isAuthenticated: state.isAuthenticated,
          }),
        },
      ),
      {
        name: 'auth-store',
        enabled: process.env.NODE_ENV === 'development',
      },
    ),
  ),
);
