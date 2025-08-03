'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import * as Molecules from '@/molecules';

// Map paths to step numbers and titles
const pathToStepConfig: Record<string, { step: number; title: string }> = {
  '/onboarding/install': { step: 1, title: 'Identity keys' },
  '/onboarding/scan': { step: 2, title: 'Use Pubky Ring' },
  '/onboarding/pubky': { step: 2, title: 'Your pubky' },
  '/onboarding/backup': { step: 3, title: 'Backup' },
};

export function Header() {
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentTitle, setCurrentTitle] = useState('');
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    const config = pathToStepConfig[pathname] || { step: 1, title: 'Sign in' };
    setCurrentStep(config.step);
    setCurrentTitle(config.title);
    setIsOnboarding(pathname.startsWith('/onboarding'));
  }, [pathname]);

  return (
    <Molecules.HeaderContainer>
      <Molecules.Logo />
      <Molecules.HeaderTitle currentTitle={currentTitle} />
      {isOnboarding ? <Molecules.OnboardingHeader currentStep={currentStep} /> : <Molecules.HomeHeader />}
    </Molecules.HeaderContainer>
  );
}
