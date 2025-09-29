import { AuthStore } from './auth.types';
import { ZustandGet } from '../stores.types';

// Selectors - State access functions with validation
export const createAuthSelectors = (get: ZustandGet<AuthStore>) => ({
  // call: Core.useAuthStore((state) => state.selectCurrentUserPubky())
  selectCurrentUserPubky: () => {
    const pubky = get().currentUserPubky;
    if (pubky === null) {
      throw new Error('Current user pubky is not available. User may not be authenticated.');
    }
    return pubky;
  },
});
