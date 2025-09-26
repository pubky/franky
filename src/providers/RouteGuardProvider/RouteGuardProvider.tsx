'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import * as Hooks from '@/hooks';
import * as Providers from '@/providers';
import * as App from '@/app';

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
 */
export function RouteGuardProvider({ children }: RouteGuardProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, isLoading } = Hooks.useAuthStatus();

  // Determine if the current route is accessible based on authentication status
  const isRouteAccessible = useMemo(() => {
    // Wait for authentication status to be determined before allowing access
    if (isLoading) return false;

    // Public routes are always accessible regardless of authentication status
    if (App.PUBLIC_ROUTES.includes(pathname)) return true;

    // Get the allowed routes for the current authentication status
    const routeAccess = Providers.ROUTE_ACCESS_MAP[status];

    // Check if current pathname matches any allowed route (exact match or sub-route)
    return routeAccess.allowedRoutes.some((route) => {
      return pathname === route || pathname.startsWith(route + '/');
    });
  }, [isLoading, pathname, status]);

  // Handle automatic redirects when user tries to access unauthorized routes
  useEffect(() => {
    // Wait for authentication status to be determined
    if (isLoading) return;

    // No redirect needed if user has access to current route
    if (isRouteAccessible) return;

    // Redirect user to the appropriate default route for their authentication status
    const routeAccess = Providers.ROUTE_ACCESS_MAP[status];
    const redirectTo = routeAccess.redirectTo;

    // Only redirect if we have a target and we're not already there
    if (redirectTo && pathname !== redirectTo) {
      router.push(redirectTo);
    }
  }, [status, pathname, router, isLoading, isRouteAccessible]);

  // Show loading spinner while determining authentication status or route access
  if (isLoading || !isRouteAccessible) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{isLoading ? 'Loading...' : 'Checking access...'}</p>
        </div>
      </div>
    );
  }

  // Render the protected content only when user has confirmed access
  return <>{children}</>;
}
