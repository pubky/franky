'use client';

import { OnboardingHeader, ScanContent } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function InstallPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/onboarding/install');
  };

  return (
    <div className="min-h-screen bg-background">
      <OnboardingHeader title="Identity keys" currentStep={2} totalSteps={5} />

      <ScanContent onHandleBackButton={handleBack} />
    </div>
  );
}
