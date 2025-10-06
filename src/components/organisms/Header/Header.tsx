'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Core from '@/core';
import * as App from '@/app';

// Map paths to step numbers and titles
const pathToStepConfig: Record<string, { step: number; title: string }> = {
  '/onboarding/install': { step: 1, title: 'Identity keys' },
  '/onboarding/scan': { step: 2, title: 'Use Pubky Ring' },
  '/onboarding/pubky': { step: 2, title: 'Your pubky' },
  '/onboarding/backup': { step: 3, title: 'Backup' },
  '/onboarding/homeserver': { step: 4, title: 'Homeserver' },
  '/onboarding/profile': { step: 5, title: 'Profile' },
  '/logout': { step: 1, title: 'Signed out' },
};

export function Header() {
  const { isAuthenticated } = Core.useAuthStore();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentTitle, setCurrentTitle] = useState('');
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const config = pathToStepConfig[pathname] || { step: 1, title: 'Sign in' };
    setCurrentStep(config.step);
    setCurrentTitle(config.title);
    setIsOnboarding(pathname?.startsWith('/onboarding') || false);
    setIsSignedIn(isAuthenticated);
  }, [pathname, isAuthenticated]);

  return (
    <Molecules.HeaderContainer>
      <Molecules.Logo noLink={currentStep === 5} />
      {(!isSignedIn || currentStep === 5) && <Molecules.HeaderTitle currentTitle={currentTitle} />}
      {isOnboarding ? (
        <Molecules.HeaderOnboarding currentStep={currentStep} />
      ) : isSignedIn ? (
        <HeaderSignIn />
      ) : (
        <HeaderHome />
      )}
    </Molecules.HeaderContainer>
  );
}

export function HeaderButtonSignIn({ ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  const router = useRouter();

  const handleSignIn = () => {
    router.push(App.AUTH_ROUTES.SIGN_IN);
  };

  return (
    <Atoms.Button variant="secondary" onClick={handleSignIn} {...props}>
      <Libs.LogIn className="mr-2 h-4 w-4" />
      Sign in
    </Atoms.Button>
  );
}

export const HeaderHome = () => {
  return (
    <Atoms.Container className="flex-1 flex-row items-center justify-end">
      <Molecules.HeaderSocialLinks />
      <HeaderButtonSignIn />
    </Atoms.Container>
  );
};

export const HeaderSignIn = () => {
  const currentUserPubky = Core.useAuthStore((state) => state.currentUserPubky);
  const userDetails = useLiveQuery(
    () => (currentUserPubky ? Core.db.user_details.get(currentUserPubky) : undefined),
    [currentUserPubky],
  );

  const avatarImage = userDetails?.image || '/images/default-avatar.png';
  const avatarInitial = Libs.extractInitials({ name: userDetails?.name || '' }) || 'U';

  return (
    <Atoms.Container className="flex-1 flex-row items-center justify-end gap-3">
      <Molecules.SearchInput />
      <Molecules.HeaderNavigationButtons avatarImage={avatarImage} avatarInitial={avatarInitial} />
    </Atoms.Container>
  );
};
