import { ProfileStore } from './profile.types';
import { ZustandGet } from '../stores.types';

// Selectors - State access functions with validation
export const createProfileSelectors = (get: ZustandGet<ProfileStore>) => ({
  // call: Core.useProfileStore((state) => state.selectSection())
  selectSection: () => {
    const section = get().section;
    return section;
  },
});
