'use client';

import React from 'react';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import Image from 'next/image';
import * as Organisms from '@/organisms';

interface DialogBackupProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface BackupMethodCardProps {
  title: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  dialog: React.ReactNode;
}

function BackupMethodCard({ title, imageSrc, imageAlt, dialog }: BackupMethodCardProps) {
  return (
    <Atoms.Card className="w-full p-4 md:p-8 flex-col gap-4 md:gap-6">
      <Atoms.Typography size="md" className="text-base font-bold text-card-foreground leading-none">
        {title}
      </Atoms.Typography>
      <Image src={imageSrc} alt={imageAlt} width={112} height={112} className="self-center w-16 h-16 md:w-28 md:h-28" />
      {dialog}
    </Atoms.Card>
  );
}

export function DialogBackup({ open, onOpenChange }: DialogBackupProps = {}) {
  const { mnemonic } = Core.useOnboardingStore();

  return (
    <Atoms.Dialog open={open} onOpenChange={onOpenChange}>
      {open === undefined && (
        <Atoms.DialogTrigger asChild>
          <Atoms.Button
            id="backup-btn"
            variant="outline"
            className="text-primary-foreground hover:text-primary-foreground text-xs font-bold border shadow-sm"
          >
            Backup
          </Atoms.Button>
        </Atoms.DialogTrigger>
      )}
      <Atoms.DialogContent className="max-w-sm md:max-w-2xl" hiddenTitle="Back up your pubky">
        <Atoms.DialogHeader>
          <Atoms.DialogTitle id="backup-dialog-title">Back up your pubky</Atoms.DialogTitle>
          <Atoms.DialogDescription id="backup-dialog-description">
            Safely back up and store the secret seed for your pubky. Which backup method do you prefer? You can choose
            multiple backup methods if you wish.
          </Atoms.DialogDescription>
        </Atoms.DialogHeader>
        <Atoms.Container className="md:flex-row flex-col gap-3">
          <BackupMethodCard
            title={
              <>
                Recovery
                <br className="hidden md:inline" /> phrase
              </>
            }
            imageSrc="/images/note.png"
            imageAlt="Note"
            dialog={<Organisms.DialogBackupPhrase />}
          />
          <BackupMethodCard
            title="Download encrypted file"
            imageSrc="/images/folder.png"
            imageAlt="Folder"
            dialog={<Organisms.DialogBackupEncrypted />}
          />
          <BackupMethodCard
            title="Export to Pubky Ring"
            imageSrc="/images/keyring.png"
            imageAlt="Keys"
            dialog={<Organisms.DialogBackupExport mnemonic={mnemonic} />}
          />
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
