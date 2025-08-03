'use client';

import { useRouter } from 'next/navigation';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';

export const HomeActions = () => {
  const router = useRouter();

  const handleCreateAccount = () => {
    router.push('/onboarding/install');
  };

  const handleSignIn = () => {
    console.log('Sign in clicked');
  };

  return <Molecules.ActionButtons onSignIn={handleSignIn} onCreateAccount={handleCreateAccount} />;
};

export const HomeFooter = () => {
  return (
    <Atoms.FooterLinks>
      By creating a Pubky account, you agree to the <Molecules.DialogTerms linkText="Terms of Service" />,{' '}
      <Molecules.DialogPrivacy linkText="Privacy Policy" />, and confirm you are{' '}
      <Molecules.DialogAge linkText="over 18 years old." /> Pubky is powered by{' '}
      <Atoms.Link href="https://pubky.org/" target="_blank">
        Pubky Core
      </Atoms.Link>{' '}
      and was built with love and dedication by Synonym Software Ltd. ©2025.
    </Atoms.FooterLinks>
  );
};

export const HomeSectionTitle = () => {
  return (
    <Atoms.Container className="flex-row items-start gap-2 pt-6">
      <Atoms.Typography size="lg" className="text-brand font-normal">
        Pubky requires an invite code
      </Atoms.Typography>
      <Molecules.PopoverInvite />
    </Atoms.Container>
  );
};

export const HomePageHeading = () => {
  return (
    <Atoms.Heading level={1} size="2xl">
      <span className="text-brand">Unlock</span> the web.
    </Atoms.Heading>
  );
};
