'use client';

import { InstallContent } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function InstallPage() {
  const router = useRouter();

  const handleCreateKeysInBrowser = () => {
    // TODO: Implement create keys in browser functionality
    console.log('Create keys in browser clicked');
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
