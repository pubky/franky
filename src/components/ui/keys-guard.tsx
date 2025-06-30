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
  const { secretKey, hasGenerated, hasHydrated } = useKeypairStore();

  // Helper function to check if keys are persisted in localStorage
  const areKeysPersisted = () => {
    try {
      const stored = localStorage.getItem('keypair-storage');
      if (!stored) return false;

      const parsed = JSON.parse(stored);
      return !!(parsed.state?.secretKey && parsed.state?.hasGenerated);
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (requireKeys && hasHydrated) {
      const hasValidInMemoryKeys =
        hasGenerated && secretKey && secretKey instanceof Uint8Array && secretKey.length === 32;
      const hasPersistedKeys = areKeysPersisted();

      // Keys must exist both in memory AND in localStorage
      if (!hasValidInMemoryKeys || !hasPersistedKeys) {
        router.push(fallbackRoute);
        return;
      }
    }
  }, [requireKeys, hasGenerated, secretKey, hasHydrated, fallbackRoute, router]);

  // Only render children if keys are valid and persisted
  if (requireKeys) {
    // Wait for hydration to complete before checking
    if (!hasHydrated) {
      return null; // Don't render anything while hydrating
    }

    const hasValidInMemoryKeys =
      hasGenerated && secretKey && secretKey instanceof Uint8Array && secretKey.length === 32;
    const hasPersistedKeys = areKeysPersisted();

    if (!hasValidInMemoryKeys || !hasPersistedKeys) {
      return null; // Don't render anything while redirecting
    }
  }

  return <>{children}</>;
}
