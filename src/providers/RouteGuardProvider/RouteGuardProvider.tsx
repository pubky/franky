'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import * as Hooks from '@/hooks';
import * as Providers from '@/providers';

interface RouteGuardProviderProps {
  children: React.ReactNode;
}

export function RouteGuardProvider({ children }: RouteGuardProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, isLoading } = Hooks.useAuthStatus();

  // Check if current route is allowed BEFORE rendering
  const isRouteAccessible = useMemo(() => {
    // If still loading, don't allow access yet
    if (isLoading) return false;

    // Always allow access to public routes
    if (Providers.PUBLIC_ROUTES.includes(pathname)) return true;

    const routeAccess = Providers.ROUTE_ACCESS_MAP[status];
    return routeAccess.allowedRoutes.some((route) => {
      // Exact match or starts with route pattern
      return pathname === route || pathname.startsWith(route + '/');
    });
  }, [isLoading, pathname, status]);

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Don't redirect if route is accessible
    if (isRouteAccessible) return;

    // Redirect to the default route for this auth status
    const routeAccess = Providers.ROUTE_ACCESS_MAP[status];
    const redirectTo = routeAccess.redirectTo;

    if (redirectTo && pathname !== redirectTo) {
      router.push(redirectTo);
    }
  }, [status, pathname, router, isLoading, isRouteAccessible]);

  // Show loading state while hydrating OR while checking route access
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

  // Only render children when route access is confirmed
  return <>{children}</>;
}
