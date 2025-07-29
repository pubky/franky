'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { OnboardingHeader } from '@/components/ui';

// Map paths to step numbers and titles
const pathToStepConfig: Record<string, { step: number; title: string }> = {
  '/onboarding/install': { step: 1, title: 'Identity keys' },
  '/onboarding/scan': { step: 2, title: 'Use Pubky Ring' },
  '/onboarding/pubky': { step: 2, title: 'Your pubky' },
  '/onboarding/backup': { step: 3, title: 'Backup' },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentTitle, setCurrentTitle] = useState('Identity keys');

  useEffect(() => {
    const config = pathToStepConfig[pathname] || { step: 1, title: 'Identity keys' };
    setCurrentStep(config.step);
    setCurrentTitle(config.title);
  }, [pathname]);

  // TODO: add a guard to check if the user is already onboarded
  // idea: add to zustand store if user is onboarded
  // if (isOnboarded) {
  //   router.push('/');
  // }

  return (
    <div className="min-h-screen bg-background">
      <OnboardingHeader title={currentTitle} currentStep={currentStep} totalSteps={5} />
      {children}
    </div>
  );
}
