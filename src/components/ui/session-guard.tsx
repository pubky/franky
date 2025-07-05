'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated } from '@/core/stores';

interface SessionGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * SessionGuard Component
 *
 * Redirects authenticated users away from public pages (homepage, onboarding)
 * to prevent them from accessing pages they shouldn't see when logged in.
 *
 * @param children - The content to render if user is not authenticated
 * @param redirectTo - Where to redirect authenticated users (defaults to /feed)
 */
export function SessionGuard({ children, redirectTo = '/feed' }: SessionGuardProps) {
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  // Don't render anything while checking authentication or redirecting
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
