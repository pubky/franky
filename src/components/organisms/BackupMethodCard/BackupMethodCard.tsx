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
          <Molecules.DialogExport mnemonic={mnemonic}>
            <Atoms.Button className="gap-2">
              <Libs.Scan className="h-4 w-4" />
              <span>{mnemonic ? 'Export recovery phrase' : 'Export to Pubky Ring'}</span>
            </Atoms.Button>
          </Molecules.DialogExport>
        </Atoms.Container>
      </Atoms.Container>
    </Molecules.ContentCard>
  );
};
