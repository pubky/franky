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
    const isLoading = !onboardingStore.hasHydrated || !authStore.hasHydrated || authStore.isRestoringSession;

    // Check if user has keypair (session)
    const hasKeypair = authStore.sessionExport !== null;

    // Check if user has profile data
    const hasProfile = authStore.hasProfile;

    // Determine the authentication status
    let status: AuthStatus;

    // User has session but no profile - needs to complete onboarding
    if (hasKeypair && !hasProfile) {
      status = AuthStatus.NEEDS_PROFILE_CREATION;
    }
    // User has profile - fully authenticated
    else if (hasKeypair && hasProfile) {
      status = AuthStatus.AUTHENTICATED;
    }
    // No session - unauthenticated
    else {
      status = AuthStatus.UNAUTHENTICATED;
    }

    return {
      status,
      isLoading,
      hasKeypair,
      hasProfile,
      isFullyAuthenticated: status === AuthStatus.AUTHENTICATED,
    };
  }, [
    onboardingStore.hasHydrated,
    authStore.hasHydrated,
    authStore.isRestoringSession,
    authStore.sessionExport,
    authStore.hasProfile,
  ]);

  return authStatusResult;
}
