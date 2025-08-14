'use client';

import { useRouter } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export const BackupMethodCard = () => {
  return (
    <Molecules.ContentCard
      image={{
        src: '/images/shield.png',
        alt: 'Shield',
        width: 228,
        height: 228,
        size: 'medium',
      }}
    >
      <Atoms.Container className="items-center gap-1 flex-row">
        <Atoms.Heading level={2} size="lg">
          Choose backup method
        </Atoms.Heading>
        <Molecules.PopoverPublicKey />
      </Atoms.Container>
      <Atoms.Container className="max-w-[686px] mx-0">
        <Atoms.Typography className="text-secondary-foreground opacity-80 font-normal">
          Safely back up and store the secret seed for your pubky. Which backup method do you prefer? You can also
          choose to do this later.
        </Atoms.Typography>
        <Atoms.Container className="flex-row mt-6 gap-3 flex-wrap">
          <Molecules.DialogBackupPhrase />
          <Molecules.DialogBackupEncrypted />
          <Molecules.DialogExport />
        </Atoms.Container>
      </Atoms.Container>
    </Molecules.ContentCard>
  );
};

export const BackupNavigation = () => {
  const router = useRouter();

  const onHandleContinueButton = () => {
    console.log('handleContinue');
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
