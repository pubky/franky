import * as Core from '@/core';

export interface ProfileState {
  currentUserPubky: Core.Pubky | null;
  session: Core.SignupResult['session'] | null;
  isAuthenticated: boolean;
}

export interface ProfileActions {
  setCurrentUserPubky: (pubky: Core.Pubky | null) => void;
  setSession: (session: Core.SignupResult['session'] | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  reset: () => void;
}

export interface ProfileSelectors {
  selectCurrentUserPubky: () => Core.Pubky;
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
