'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Stores from '@/core';
import * as Organisms from '@/organisms';

export const BackupMethodCard = () => {
  const { mnemonic } = Stores.useOnboardingStore();
  return (
    <Molecules.ContentCard
      image={{
        src: '/images/shield.png',
        alt: 'Shield',
        width: 192,
        height: 192,
      }}
    >
      <Atoms.Container className="items-center gap-1 flex-row">
        <Atoms.Heading level={2} size="lg">
          Choose backup method
        </Atoms.Heading>
        <Molecules.PopoverBackup />
      </Atoms.Container>
      <Atoms.Container className="max-w-[576px] mx-0">
        <Atoms.Typography size="sm" className="text-secondary-foreground opacity-80 font-medium text-base">
          Safely back up and store the secret seed for your pubky. Which backup method do you prefer? You can also
          choose to do this later.
        </Atoms.Typography>
        <Atoms.Container className="flex-row mt-6 gap-3 flex-wrap">
          <Molecules.DialogBackupPhrase />
          <Organisms.DialogBackupEncrypted />
          <Molecules.DialogExport mnemonic={mnemonic} />
        </Atoms.Container>
      </Atoms.Container>
    </Molecules.ContentCard>
  );
};
