import * as Core from '@/core';

export interface AuthState {
  currentUserPubky: Core.Pubky | null;
  session: Core.SignupResult['session'] | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  setCurrentUserPubky: (pubky: Core.Pubky | null) => void;
  setSession: (session: Core.SignupResult['session'] | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  reset: () => void;
}

export interface AuthSelectors {
  selectCurrentUserPubky: () => Core.Pubky;
}

export type AuthStore = AuthState & AuthActions & AuthSelectors;

export const authInitialState: AuthState = {
  currentUserPubky: null,
  session: null,
  isAuthenticated: false,
};

export enum AuthActionTypes {
  SET_PUBKY = 'SET_PUBKY',
  SET_SESSION = 'SET_SESSION',
  CLEAR_SESSION = 'CLEAR_SESSION',
  SET_AUTHENTICATED = 'SET_AUTHENTICATED',
  RESET = 'RESET',
}
