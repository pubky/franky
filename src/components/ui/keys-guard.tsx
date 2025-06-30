import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKeypairStore } from '@/core/stores';

interface KeysGuardProps {
  children: ReactNode;
  requireKeys?: boolean;
  fallbackRoute?: string;
}

export function KeysGuard({ children, requireKeys = true, fallbackRoute = '/onboarding' }: KeysGuardProps) {
  const router = useRouter();
  const { secretKey, hasGenerated } = useKeypairStore();

  useEffect(() => {
    if (requireKeys) {
      const hasValidKeys = hasGenerated && secretKey && secretKey instanceof Uint8Array;

      if (!hasValidKeys) {
        router.push(fallbackRoute);
        return;
      }
    }
  }, [requireKeys, hasGenerated, secretKey, fallbackRoute, router]);

  // Only render children if keys are valid
  if (requireKeys) {
    const hasValidKeys = hasGenerated && secretKey && secretKey instanceof Uint8Array;
    if (!hasValidKeys) {
      return null; // Don't render anything while redirecting
    }
  }

  return <>{children}</>;
}
