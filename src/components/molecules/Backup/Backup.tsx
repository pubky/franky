'use client';

import { useRouter } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export const BackupNavigation = () => {
  const router = useRouter();

  const onHandleContinueButton = () => {
    router.push('/onboarding/homeserver');
  };

  const onHandleBackButton = () => {
    router.push('/onboarding/pubky');
  };

  return (
    <Molecules.ButtonsNavigation
      className="py-6"
      onHandleBackButton={onHandleBackButton}
      onHandleContinueButton={onHandleContinueButton}
      backText="Back"
      continueText="Continue"
    />
  );
};

export const BackupPageHeader = () => {
  return (
    <Atoms.PageHeader>
      <Molecules.PageTitle size="large">
        Back up your <span className="text-brand">pubky.</span>
      </Molecules.PageTitle>
      <Atoms.PageSubtitle>You need a backup to restore access to your account later.</Atoms.PageSubtitle>
    </Atoms.PageHeader>
  );
};
