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
        width: 192,
        height: 192,
        size: 'medium',
      }}
    >
      <Atoms.Container className="items-center gap-1 flex-row">
        <Atoms.Heading level={3} size="md">
          Choose backup method
        </Atoms.Heading>
        <Molecules.PopoverPublicKey />
      </Atoms.Container>
      <Atoms.Container className="flex-col gap-3">
        <Atoms.Typography className="text-secondary-foreground opacity-80 font-normal">
          Safely back up and store the secret seed for your pubky. Which backup method do you prefer? You can also
          choose to do this later.
        </Atoms.Typography>
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
      onHandleBackButton={onHandleBackButton}
      onHandleContinueButton={onHandleContinueButton}
      backText="Back"
      continueText="Continue"
    />
  );
};

export const BackupPageHeader = () => {
  return (
    <>
      <Atoms.Heading level={1} size="2xl">
        <span className="text-brand">Backup</span> your pubky.
      </Atoms.Heading>
      <Atoms.PageSubtitle title="You need a backup to restore access to your account later." />
    </>
  );
};
