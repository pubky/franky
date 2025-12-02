import { useMemo } from 'react';

import * as Core from '@/core';
// Import directly from local types to avoid circular dependency with @/hooks barrel
import { AuthStatus, type AuthStatusResult } from './useAuthStatus.types';

export function useAuthStatus(): AuthStatusResult {
  // Get state from stores
  const onboardingStore = Core.useOnboardingStore();
  const authStore = Core.useAuthStore();

  const authStatusResult = useMemo((): AuthStatusResult => {
    // Check if stores are still hydrating
    const isLoading = !onboardingStore.hasHydrated;

    // Check if user has keypair
    const hasKeypair = Boolean(onboardingStore.pubky && onboardingStore.secretKey);

    // Check if user has profile data
    const hasProfile = authStore.isAuthenticated;

    // Determine the authentication status
    let status: AuthStatus;

    // TODO: add validation here to check when the user has a session but no profile
    if (!authStore.isAuthenticated) {
      status = AuthStatus.UNAUTHENTICATED;
    } else {
      status = AuthStatus.AUTHENTICATED;
    }

    return {
      status,
      isLoading,
      hasKeypair,
      hasProfile,
      isFullyAuthenticated: status === AuthStatus.AUTHENTICATED,
    };
  }, [onboardingStore.hasHydrated, onboardingStore.pubky, onboardingStore.secretKey, authStore.isAuthenticated]);

  return authStatusResult;
}
