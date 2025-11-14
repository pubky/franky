'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Stores from '@/core';
import * as Libs from '@/libs';

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
      <Atoms.Container className="flex-row items-center gap-1">
        <Atoms.Heading level={2} size="lg">
          Choose backup method
        </Atoms.Heading>
        <Molecules.PopoverBackup />
      </Atoms.Container>
      <Atoms.Container className="mx-0 max-w-[576px]">
        <Atoms.Typography size="sm" className="text-base font-medium text-secondary-foreground opacity-80">
          Safely back up and store the secret seed for your pubky. Which backup method do you prefer? You can also
          choose to do this later.
        </Atoms.Typography>
        <Atoms.Container className="mt-6 flex-row flex-wrap gap-3">
          <Organisms.DialogBackupPhrase>
            <Atoms.Button id="backup-recovery-phrase-btn" variant="secondary" className="gap-2">
              <Libs.FileText className="h-4 w-4" />
              <span>Recovery phrase</span>
            </Atoms.Button>
          </Organisms.DialogBackupPhrase>
          <Organisms.DialogBackupEncrypted>
            <Atoms.Button id="backup-encrypted-file-btn" variant="secondary" className="gap-2">
              <Libs.FileText className="h-4 w-4" />
              <span>Encrypted file</span>
            </Atoms.Button>
          </Organisms.DialogBackupEncrypted>
          <Organisms.DialogBackupExport mnemonic={mnemonic}>
            <Atoms.Button className="gap-2">
              <Libs.Scan className="h-4 w-4" />
              <span>{mnemonic ? 'Export recovery phrase' : 'Export to Pubky Ring'}</span>
            </Atoms.Button>
          </Organisms.DialogBackupExport>
        </Atoms.Container>
      </Atoms.Container>
    </Molecules.ContentCard>
  );
};
