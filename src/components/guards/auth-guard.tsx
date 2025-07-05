'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated } from '@/core/stores';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * AuthGuard Component
 *
 * Redirects unauthenticated users away from protected pages
 * to prevent them from accessing pages they shouldn't see when not logged in.
 *
 * @param children - The content to render if user is authenticated
 * @param redirectTo - Where to redirect unauthenticated users (defaults to /)
 */
export function AuthGuard({ children, redirectTo = '/' }: AuthGuardProps) {
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  // Don't render anything while checking authentication or redirecting
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
