import { AuthStore, AuthActions, authInitialState, AuthActionTypes, AuthInitParams } from './auth.types';
import { ZustandSet } from '../stores.types';
import * as Core from '@/core';
import { Session } from '@synonymdev/pubky';

// Actions/Mutators - State modification functions
export const createAuthActions = (set: ZustandSet<AuthStore>): AuthActions => ({
  init: ({ session, currentUserPubky, hasProfile }: AuthInitParams) => {
    set((state) => ({
      ...state,
      session,
      currentUserPubky,
      hasProfile 
    }),
    false, AuthActionTypes.INIT
  )},
  // Storage management
  reset: () => {
    set(
      (state) => ({
        ...authInitialState,
        hasHydrated: state.hasHydrated, // Preserve or reset hydration
      }),
      false,
      AuthActionTypes.RESET,
    );
  },
  // Authentication data management
  setCurrentUserPubky: (pubky: Core.Pubky | null) => {
    set({ currentUserPubky: pubky }, false, AuthActionTypes.SET_PUBKY);
  },

  setSession: (session: Session | null) => {
    set({ session }, false, AuthActionTypes.SET_SESSION);
  },

  setHasProfile: (hasProfile: boolean) => {
    set({ hasProfile }, false, AuthActionTypes.SET_HAS_PROFILE);
  },

  setHasHydrated: (hasHydrated: boolean) => {
    set({ hasHydrated }, false, AuthActionTypes.SET_HAS_HYDRATED);
  },
});
