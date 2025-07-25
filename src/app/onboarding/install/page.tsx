'use client';

import { OnboardingHeader, InstallContent } from '@/components/ui';
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
    <div className="min-h-screen bg-background">
      <OnboardingHeader title="Identity keys" currentStep={1} totalSteps={5} />

      <InstallContent
        onCreateKeysInBrowser={handleCreateKeysInBrowser}
        onContinueWithPubkyRing={handleContinueWithPubkyRing}
      />
    </div>
  );
}
