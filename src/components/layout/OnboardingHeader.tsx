'use client';

import { usePathname } from 'next/navigation';
import { Stepper, Logo } from '@/components/ui';

const onboardingSteps = [
  {
    id: 1,
    title: 'Start here',
  },
  {
    id: 2,
    title: 'Identity',
  },
  {
    id: 3,
    title: 'Backup',
  },
  {
    id: 4,
    title: 'Sign Up',
  },
  {
    id: 5,
    title: 'Profile',
  },
];

function getCurrentStep(pathname: string): number {
  if (pathname === '/onboarding') {
    return 1; // Start here step
  }
  if (pathname.includes('/onboarding/keys')) {
    return 2; // Identity step
  }
  if (pathname.includes('/onboarding/backup')) {
    return 3; // Backup step
  }
  if (pathname.includes('/onboarding/homeserver')) {
    return 4; // Sign up step
  }
  if (pathname.includes('/onboarding/profile')) {
    return 5; // Profile step
  }
  return 1; // Default to first step
}

export function OnboardingHeader() {
  const pathname = usePathname();
  const currentStep = getCurrentStep(pathname);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 min-h-[65px] flex items-center">
      <div className="container mx-auto px-6 py-4 max-w-screen-xl">
        <div className="flex items-center">
          {/* Logo - Link to homepage */}
          <div className="flex-shrink-0 mr-16">
            <Logo textColor="white" />
          </div>

          {/* Stepper - takes remaining space */}
          <div className="flex-1">
            <Stepper steps={onboardingSteps} currentStep={currentStep} />
          </div>
        </div>
      </div>
    </header>
  );
}
