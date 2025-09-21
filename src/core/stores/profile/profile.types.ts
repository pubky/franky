import { SignupResult } from '@/core';

export interface ProfileState {
  currentUserPubky: string | null;
  session: SignupResult['session'] | null;
  isAuthenticated: boolean;
}

export interface ProfileActions {
  setCurrentUserPubky: (pubky: string | null) => void;
  setSession: (session: SignupResult['session'] | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  reset: () => void;
}

export interface ProfileSelectors {
  selectCurrentUserPubky: () => string;
}

export type ProfileStore = ProfileState & ProfileActions & ProfileSelectors;

export const profileInitialState: ProfileState = {
  currentUserPubky: null,
  session: null,
  isAuthenticated: false,
};

export enum ProfileActionTypes {
  SET_PUBKY = 'SET_PUBKY',
  SET_SESSION = 'SET_SESSION',
  CLEAR_SESSION = 'CLEAR_SESSION',
  SET_AUTHENTICATED = 'SET_AUTHENTICATED',
  RESET = 'RESET',
}
