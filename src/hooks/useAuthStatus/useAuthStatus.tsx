import { useMemo } from 'react';

import * as Core from '@/core';
import * as Hooks from '@/hooks';

export function useAuthStatus(): Hooks.AuthStatusResult {
  // Get state from stores
  const onboardingStore = Core.useOnboardingStore();
  const profileStore = Core.useProfileStore();

  const authStatusResult = useMemo((): Hooks.AuthStatusResult => {
    // Check if stores are still hydrating
    const isLoading = !onboardingStore.hasHydrated;

    // Check if user has keypair
    const hasKeypair = Boolean(onboardingStore.pubky && onboardingStore.secretKey);

    // Check if user has profile data
    const hasProfile = profileStore.isAuthenticated;

    // Determine the authentication status
    let status: Hooks.AuthStatus;

    // TODO: add validation here to check when the user has a session but no profile
    if (!profileStore.isAuthenticated) {
      status = Hooks.AuthStatus.UNAUTHENTICATED;
    } else {
      status = Hooks.AuthStatus.AUTHENTICATED;
    }

    return {
      status,
      isLoading,
      hasKeypair,
      hasProfile,
      isFullyAuthenticated: status === Hooks.AuthStatus.AUTHENTICATED,
    };
  }, [onboardingStore.hasHydrated, onboardingStore.pubky, onboardingStore.secretKey, profileStore.isAuthenticated]);

  return authStatusResult;
}
