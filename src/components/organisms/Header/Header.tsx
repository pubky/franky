'use client';

import { usePathname } from 'next/navigation';

import * as Core from '@/core';
import * as Molecules from '@/molecules';
import { pathToStepConfig } from './Header.constants';

export function Header() {
  const pathname = usePathname();
  const authStore = Core.useAuthStore();
  const isAuthenticated = authStore.selectIsAuthenticated();

  const isOnboarding = pathname?.startsWith('/onboarding') ?? false;
  const isCopyrightPage = pathname === '/copyright';
  const { step: currentStep, title: currentTitle } = pathToStepConfig[pathname] ?? { step: 1, title: 'Sign in' };

  const shouldHideHeaderOnMobile = isAuthenticated && !isOnboarding;

  // Copyright page shows only logo (minimal header)
  if (isCopyrightPage) {
    return (
      <Molecules.HeaderContainer>
        <Molecules.Logo />
      </Molecules.HeaderContainer>
    );
  }

  return (
    <Molecules.HeaderContainer className={shouldHideHeaderOnMobile ? 'hidden lg:block' : undefined}>
      <Molecules.Logo noLink={currentStep === 5} />
      {(!isAuthenticated || currentStep === 5) && <Molecules.HeaderTitle currentTitle={currentTitle} />}
      {isOnboarding ? (
        <Molecules.HeaderOnboarding currentStep={currentStep} />
      ) : isAuthenticated ? (
        <Molecules.HeaderSignIn />
      ) : (
        <Molecules.HeaderHome />
      )}
    </Molecules.HeaderContainer>
  );
}
