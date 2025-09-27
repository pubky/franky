import { ProfileStore, ProfileActions, profileInitialState, ProfileActionTypes, ProfileSection } from './profile.types';
import { ZustandSet } from '../stores.types';

// Actions/Mutators - State modification functions
export const createProfileActions = (set: ZustandSet<ProfileStore>): ProfileActions => ({
  // Section name management
  setSection: (section: ProfileSection) => {
    set({ section }, false, ProfileActionTypes.SET_PROFILE_SECTION);
  },

  // Storage management
  reset: () => {
    set(profileInitialState, false, ProfileActionTypes.RESET_PROFILE);
  },
});
