'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import { GITHUB_URL, TWITTER_GETPUBKY_URL, TELEGRAM_URL } from '@/config';

export const HeaderContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Atoms.Container
      as="header"
      size="container"
      className="py-6 items-center px-6 sticky top-0 z-10 bg-gradient-to-b from-[var(--background)] to-[var(--transparent)] h-[96px] md:h-[144px]"
    >
      <Atoms.Container as="nav" className="flex-row items-center py-0 md:py-6 gap-6 w-full h-full">
        {children}
      </Atoms.Container>
    </Atoms.Container>
  );
};

export const HeaderTitle = ({ currentTitle }: { currentTitle: string }) => {
  return (
    <Atoms.Container className="flex-1 hidden md:flex">
      <Atoms.Heading level={2} size="lg" className="text-muted-foreground font-normal">
        {currentTitle}
      </Atoms.Heading>
    </Atoms.Container>
  );
};

export const OnboardingHeader = ({ currentStep }: { currentStep: number }) => {
  return <Molecules.ProgressSteps currentStep={currentStep} totalSteps={5} />;
};

export function SocialLinks({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Atoms.Container className={Libs.cn('hidden md:flex flex-row justify-end gap-6 mr-6', props.className)}>
      <Atoms.Link href={GITHUB_URL} target="_blank" variant="muted" size="default">
        <Libs.Github2 className="w-6 h-6" />
      </Atoms.Link>
      <Atoms.Link href={TWITTER_GETPUBKY_URL} target="_blank" variant="muted" size="default">
        <Libs.XTwitter className="w-6 h-6" />
      </Atoms.Link>
      <Atoms.Link href={TELEGRAM_URL} target="_blank" variant="muted" size="default">
        <Libs.Telegram className="w-6 h-6" />
      </Atoms.Link>
    </Atoms.Container>
  );
}

export function ButtonSignIn({ ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  const handleSignIn = () => {
    console.log('sign in');
  };

  return (
    <Atoms.Button variant="secondary" onClick={handleSignIn} {...props}>
      <Libs.LogIn className="mr-2 h-4 w-4" />
      Sign in
    </Atoms.Button>
  );
}

export const HomeHeader = () => {
  return (
    <Atoms.Container className="flex-1 flex-row items-center justify-end">
      <Molecules.SocialLinks />
      <Molecules.ButtonSignIn />
    </Atoms.Container>
  );
};
