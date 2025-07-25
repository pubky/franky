'use client';

import { OnboardingHeader, InstallContent } from '@/components/ui';

export default function InstallPage() {
  const handleCreateKeysInBrowser = () => {
    // TODO: Implement create keys in browser functionality
    console.log('Create keys in browser clicked');
  };

  const handleContinueWithPubkyRing = () => {
    // TODO: Implement continue with Pubky Ring functionality
    console.log('Continue with Pubky Ring clicked');
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
