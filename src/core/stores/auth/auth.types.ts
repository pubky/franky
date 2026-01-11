import * as Core from '@/core';
import { Session } from '@synonymdev/pubky';

export interface AuthInitParams {
  currentUserPubky: Core.Pubky | null;
  session: Session | null;
  hasProfile: boolean;
}

export interface AuthState extends AuthInitParams {
  sessionExport: string | null;
  hasHydrated: boolean;
  isRestoringSession: boolean;
}

export interface AuthActions {
  reset: () => void;
  init: (params: AuthInitParams) => void;
  setCurrentUserPubky: (pubky: Core.Pubky | null) => void;
  setSession: (session: Session | null) => void;
  setIsRestoringSession: (isRestoringSession: boolean) => void;
  setHasProfile: (hasProfile: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export interface AuthSelectors {
  selectCurrentUserPubky: () => Core.Pubky;
  selectIsAuthenticated: () => boolean;
  selectSession: () => Session | null;
}

export type AuthStore = AuthState & AuthActions & AuthSelectors;

export const authInitialState: AuthState = {
  currentUserPubky: null,
  session: null,
  sessionExport: null,
  hasProfile: false,
  hasHydrated: false,
  isRestoringSession: false,
};

export enum AuthActionTypes {
  INIT = 'INIT',
  RESET = 'RESET',
  SET_PUBKY = 'SET_PUBKY',
  SET_SESSION = 'SET_SESSION',
  CLEAR_SESSION = 'CLEAR_SESSION',
  SET_IS_RESTORING_SESSION = 'SET_IS_RESTORING_SESSION',
  SET_HAS_PROFILE = 'SET_HAS_PROFILE',
  SET_HAS_HYDRATED = 'SET_HAS_HYDRATED',
}
