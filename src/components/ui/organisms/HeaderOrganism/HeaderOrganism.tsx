'use client';

import { Logo, SocialLinks, Container, ButtonSignIn, Heading, ProgressSteps } from '@/components/ui';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Map paths to step numbers and titles
const pathToStepConfig: Record<string, { step: number; title: string }> = {
  '/onboarding/install': { step: 1, title: 'Identity keys' },
  '/onboarding/scan': { step: 2, title: 'Use Pubky Ring' },
  '/onboarding/pubky': { step: 2, title: 'Your pubky' },
  '/onboarding/backup': { step: 3, title: 'Backup' },
};

export function HeaderOrganism() {
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
    <Container as="header" size="container">
      <Container className="px-6 lg:px-10 py-6">
        <Container as="nav" className="flex-row items-center gap-6 w-full h-16">
          <Logo />
          <HeaderTitleOrganism currentTitle={currentTitle} />
          <OnboardingHeaderOrganism currentStep={currentStep} isOnboarding={isOnboarding} />
          <HomeHeaderOrganism isOnboarding={isOnboarding} />
        </Container>
      </Container>
    </Container>
  );
}

export const HeaderTitleOrganism = ({ currentTitle }: { currentTitle: string }) => {
  return (
    <Container className="flex-1">
      <Heading level={2} size="sm" className="text-muted-foreground font-normal">
        {currentTitle}
      </Heading>
    </Container>
  );
};

export const OnboardingHeaderOrganism = ({
  currentStep,
  isOnboarding,
}: {
  currentStep: number;
  isOnboarding: boolean;
}) => {
  return isOnboarding ? <ProgressSteps currentStep={currentStep} totalSteps={5} /> : null;
};

export const HomeHeaderOrganism = ({ isOnboarding }: { isOnboarding: boolean }) => {
  return !isOnboarding ? (
    <Container className="flex-1 flex-row items-center justify-end gap-6">
      <SocialLinks />
      <ButtonSignIn />
    </Container>
  ) : null;
};
