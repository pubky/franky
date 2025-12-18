'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import * as Hooks from '@/hooks';
import * as Providers from '@/providers';
import * as App from '@/app';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Core from '@/core';

interface RouteGuardProviderProps {
  children: React.ReactNode;
}

/**
 * RouteGuardProvider protects routes based on user authentication status.
 *
 * This provider:
 * - Checks if the current route is accessible for the user's auth status
 * - Redirects unauthorized users to appropriate default routes
 * - Shows loading states while determining access permissions
 * - Allows public routes to be accessed by anyone
 *
 * Route access is configured via ROUTE_ACCESS_MAP which maps:
 * - UNAUTHENTICATED users → onboarding/auth routes
 * - AUTHENTICATED users → app routes (feed, profile, etc.)
 * - NEEDS_PROFILE_CREATION users → profile creation route
 */
export function RouteGuardProvider({ children }: RouteGuardProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, isLoading } = Hooks.useAuthStatus();
  const hasHydrated = Core.useAuthStore((state) => state.hasHydrated);
  const session = Core.useAuthStore((state) => state.session);
  const sessionExport = Core.useAuthStore((state) => state.sessionExport);

  // Attempt to restore an existing session snapshot on fresh loads.
  useEffect(() => {
    void Core.AuthController.maybeRestoreSessionOnHydration({ hasHydrated, session, sessionExport });
  }, [hasHydrated, session, sessionExport]);

  // Determine if the current route is accessible based on authentication status
  const isRouteAccessible = useMemo(() => {
    // Public routes are ALWAYS accessible, even during loading
    if (App.PUBLIC_ROUTES.includes(pathname)) return true;

    // Wait for authentication status to be determined before allowing access to protected routes
    if (isLoading) return false;

    // Get the allowed routes for the current authentication status
    const routeAccess = Providers.ROUTE_ACCESS_MAP[status];

    // Check if current pathname matches any allowed route (exact match or sub-route)
    return routeAccess.allowedRoutes.some((route) => {
      return pathname === route || pathname.startsWith(route + '/');
    });
  }, [isLoading, pathname, status]);

  // Handle automatic redirects when user tries to access unauthorized routes
  useEffect(() => {
    // Public routes never redirect
    if (App.PUBLIC_ROUTES.includes(pathname)) return;

    // Wait for authentication status to be determined for protected routes
    if (isLoading) return;

    // No redirect needed if user has access to current route
    if (isRouteAccessible) return;

    // Redirect user to the appropriate default route for their authentication status
    const routeAccess = Providers.ROUTE_ACCESS_MAP[status];
    const redirectTo = routeAccess.redirectTo;

    // Runtime validation: ensure redirect target is actually in allowed routes
    if (redirectTo && !routeAccess.allowedRoutes.includes(redirectTo)) {
      Libs.Logger.error(
        `RouteGuard configuration error: redirectTo "${redirectTo}" is not in allowedRoutes for status "${status}"`,
      );
      return;
    }

    // Only redirect if we have a target and we're not already there
    if (redirectTo && pathname !== redirectTo) {
      router.push(redirectTo);
    }
  }, [status, pathname, router, isLoading, isRouteAccessible]);

  // Show loading spinner while:
  // 1. Authentication status is being determined (isLoading = true)
  // 2. Route access check has completed but user doesn't have access (will trigger redirect)
  if (!isRouteAccessible) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Atoms.Spinner className="mx-auto" />
          <p className="mt-2 text-muted-foreground">{isLoading ? 'Loading...' : 'Redirecting...'}</p>
        </div>
      </div>
    );
  }

  // Render the protected content only when user has confirmed access
  return <>{children}</>;
}
