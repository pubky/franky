import * as Atoms from '@/atoms';

import { OnboardingLayoutProps } from './OnboardingLayout.types';

export function OnboardingLayout({ testId, children, navigation }: OnboardingLayoutProps) {
  return (
    <Atoms.Container
      size="container"
      className="min-h-dvh items-stretch gap-0 px-6 pb-0 pt-4 lg:min-h-0 lg:items-start lg:pb-6"
    >
      <div data-testid={testId} className="flex w-full flex-1 flex-col gap-0 lg:flex-none">
        {children}
      </div>
      {navigation && <div className="onboarding-nav mt-auto w-full lg:mt-0">{navigation}</div>}
    </Atoms.Container>
  );
}
