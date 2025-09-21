import { ProfileStore } from './profile.types';
import { ZustandGet } from '../stores.types';

// Selectors - State access functions with validation
export const createProfileSelectors = (get: ZustandGet<ProfileStore>) => ({
  // call: Core.useProfileStore((state) => state.selectCurrentUserPubky())
  selectCurrentUserPubky: () => {
    const pubky = get().currentUserPubky;
    if (pubky === null) {
      throw new Error('Current user pubky is not available. User may not be authenticated.');
    }
    return pubky;
  },
});
