import { AuthStore, AuthActions, authInitialState, AuthActionTypes } from './auth.types';
import { ZustandSet } from '../stores.types';
import * as Core from '@/core';
import { Session } from '@synonymdev/pubky';

// Actions/Mutators - State modification functions
export const createAuthActions = (set: ZustandSet<AuthStore>): AuthActions => ({
  // Authentication data management
  setCurrentUserPubky: (pubky: Core.Pubky | null) => {
    set({ currentUserPubky: pubky }, false, AuthActionTypes.SET_PUBKY);
  },

  setSession: (session: Session | null) => {
    set({ session }, false, AuthActionTypes.SET_SESSION);
  },

  setAuthenticated: (isAuthenticated: boolean) => {
    set({ isAuthenticated }, false, AuthActionTypes.SET_AUTHENTICATED);
  },

  // Storage management
  reset: () => {
    set(authInitialState, false, AuthActionTypes.RESET);
  },
});
