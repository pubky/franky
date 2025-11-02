import { AuthStore } from './auth.types';
import { ZustandGet } from '../stores.types';
import * as Libs from '@/libs';

// Selectors - State access functions with validation
export const createAuthSelectors = (get: ZustandGet<AuthStore>) => ({
  selectCurrentUserPubky: () => {
    const pubky = get().currentUserPubky;
    if (pubky === null) {
      throw Libs.createStateError(
        Libs.StateErrorType.USER_NOT_AUTHENTICATED,
        'Current user pubky is not available. User may not be authenticated.',
        401,
      );
    }
    return pubky;
  },
});
