'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as Core from '@/core';
import { useAuthStatus } from '../useAuthStatus';
import { ROUTE_ACCESS_MAP } from '@/providers/RouteGuardProvider/RouteGuardProvider.constants';
import * as App from '@/app';

export function useAuthActions() {
  const router = useRouter();
  const { status } = useAuthStatus();
  const onboardingStore = Core.useOnboardingStore();
  const authStore = Core.useAuthStore();

  // Complete profile creation and transition from status 2 to 3
  const completeProfileCreation = useCallback(
    async (profileData: { name?: string; bio?: string; avatar?: string }) => {
      try {
        // Set the user as authenticated with their pubky
        authStore.setCurrentUserPubky(onboardingStore.pubky);
        authStore.setAuthenticated(true);
        authStore.setSession(null);

        // Redirect to feed after successful profile creation
        router.push(App.FEED_ROUTES.FEED);

        return { success: true, profileData };
      } catch (error) {
        console.error('Error completing profile creation:', error);
        return { success: false, error };
      }
    },
    [onboardingStore.pubky, authStore, router],
  );

  // Logout user completely
  const logout = useCallback(() => {
    // Reset both stores
    onboardingStore.reset();
    authStore.reset();

    // Redirect to home
    router.push(App.ROOT_ROUTES);
  }, [onboardingStore, authStore, router]);

  // Check if user can access a specific route
  const canAccessRoute = useCallback(
    (route: string): boolean => {
      const routeAccess = ROUTE_ACCESS_MAP[status];

      return routeAccess.allowedRoutes.some((allowedRoute: string) => {
        return route === allowedRoute || route.startsWith(allowedRoute + '/');
      });
    },
    [status],
  );

  // Navigate to a route if allowed, otherwise redirect to default
  const navigateIfAllowed = useCallback(
    (route: string) => {
      if (canAccessRoute(route)) {
        router.push(route);
      } else {
        const defaultRoute = ROUTE_ACCESS_MAP[status].redirectTo;
        if (defaultRoute) {
          router.push(defaultRoute);
        }
      }
    },
    [canAccessRoute, router, status],
  );

  return {
    completeProfileCreation,
    logout,
    canAccessRoute,
    navigateIfAllowed,
    currentStatus: status,
  };
}
