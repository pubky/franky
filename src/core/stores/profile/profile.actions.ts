import { ProfileStore, ProfileActions, profileInitialState, ProfileActionTypes } from './profile.types';
import { ZustandSet } from '../stores.types';
import * as Core from '@/core';

// Actions/Mutators - State modification functions
export const createProfileActions = (set: ZustandSet<ProfileStore>): ProfileActions => ({
  // Authentication data management
  setCurrentUserPubky: (pubky: Core.Pubky | null) => {
    set({ currentUserPubky: pubky }, false, ProfileActionTypes.SET_PUBKY);
  },

  setSession: (session: Core.SignupResult['session'] | null) => {
    set({ session }, false, ProfileActionTypes.SET_SESSION);
  },

  setAuthenticated: (isAuthenticated: boolean) => {
    set({ isAuthenticated }, false, ProfileActionTypes.SET_AUTHENTICATED);
  },

  // Storage management
  reset: () => {
    set(profileInitialState, false, ProfileActionTypes.RESET);
  },
});
