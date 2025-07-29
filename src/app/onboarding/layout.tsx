'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { OnboardingHeader } from '@/components/ui';

// Map paths to step numbers and titles
const pathToStepConfig: Record<string, { step: number; title: string }> = {
  '/onboarding/install': { step: 1, title: 'Identity keys' },
  '/onboarding/scan': { step: 2, title: 'Use Pubky Ring' },
  '/onboarding/pubky': { step: 2, title: 'Your pubky' },
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

  return (
    <div className="min-h-screen bg-background">
      <OnboardingHeader title={currentTitle} currentStep={currentStep} totalSteps={5} />
      {children}
    </div>
  );
}
