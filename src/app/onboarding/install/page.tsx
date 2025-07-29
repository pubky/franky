'use client';

import { InstallContent } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function InstallPage() {
  const router = useRouter();

  const handleCreateKeysInBrowser = () => {
    router.push('/onboarding/pubky');
  };

  const handleContinueWithPubkyRing = () => {
    router.push('/onboarding/scan');
  };

  return (
    <InstallContent
      onCreateKeysInBrowser={handleCreateKeysInBrowser}
      onContinueWithPubkyRing={handleContinueWithPubkyRing}
    />
  );
}
