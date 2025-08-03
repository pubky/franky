'use client';

import { Github, LogIn, Send, Twitter } from 'lucide-react';
import { useRouter } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export const HeaderContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Atoms.Container as="header" size="container" className="py-6 h-36 items-center">
      <Atoms.Container as="nav" className="flex-row items-center py-6 gap-6 w-full h-full">
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
      <Atoms.Link href="https://github.com/pubky" variant="muted" size="default">
        <Github className="w-6 h-6" />
      </Atoms.Link>
      <Atoms.Link href="https://twitter.com/getpubky" variant="muted" size="default">
        <Twitter className="w-6 h-6" />
      </Atoms.Link>
      <Atoms.Link href="https://t.me/pubky" variant="muted" size="default">
        <Send className="w-6 h-6" />
      </Atoms.Link>
    </Atoms.Container>
  );
}

export function ButtonSignIn({ ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  const router = useRouter();
  const handleSignIn = () => {
    router.push('/onboarding/signin');
  };

  return (
    <Atoms.Button variant="secondary" onClick={handleSignIn} {...props}>
      <LogIn className="mr-2 h-4 w-4" />
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
