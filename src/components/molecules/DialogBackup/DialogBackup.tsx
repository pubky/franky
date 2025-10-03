'use client';

import * as Atoms from '@/atoms';
import * as Core from '@/core';
import Image from 'next/image';
import * as Molecules from '@/molecules';

export function DialogBackup() {
  const { mnemonic } = Core.useOnboardingStore();

  return (
    <Atoms.Dialog>
      <Atoms.DialogTrigger asChild>
        <Atoms.Button
          variant="outline"
          className="text-primary-foreground hover:text-primary-foreground text-xs font-bold border shadow-sm"
        >
          Backup
        </Atoms.Button>
      </Atoms.DialogTrigger>
      <Atoms.DialogContent className="sm:max-w-2xl gap-0 max-h-[90vh] p-6 md:p-8">
        <Atoms.DialogHeader>
          <Atoms.DialogTitle className="leading-[1.25] pb-2">Back up your pubky</Atoms.DialogTitle>
        </Atoms.DialogHeader>
        <Atoms.Container>
          <Atoms.Container className="gap-4 md:gap-6">
            <Atoms.Typography size="sm" className="text-muted-foreground font-medium">
              Safely back up and store the secret seed for your pubky. Which backup method do you prefer? You can choose
              multiple backup methods if you wish.
            </Atoms.Typography>
            <Atoms.Container className="w-full flex md:flex-row flex-col gap-3">
              <Atoms.Card className="w-full p-4 md:p-8 bg-card rounded-lg flex flex-col gap-4 md:gap-6">
                <Atoms.Typography size="md" className="text-base font-bold text-card-foreground leading-none">
                  Recovery
                  <br className="hidden md:inline" /> phrase
                </Atoms.Typography>
                <Image
                  src="/images/note.png"
                  alt="Note"
                  width={112}
                  height={112}
                  className="self-center w-16 h-16 md:w-28 md:h-28"
                />
                <Molecules.DialogBackupPhrase />
              </Atoms.Card>
              <Atoms.Card className="w-full p-4 md:p-8 bg-card rounded-lg flex flex-col gap-4 md:gap-6">
                <Atoms.Typography size="md" className="text-base font-bold text-card-foreground leading-none">
                  Download encrypted file
                </Atoms.Typography>
                <Image
                  src="/images/folder.png"
                  alt="Folder"
                  width={112}
                  height={112}
                  className="self-center w-16 h-16 md:w-28 md:h-28"
                />
                <Molecules.DialogBackupEncrypted />
              </Atoms.Card>
              <Atoms.Card className="w-full p-4 md:p-8 bg-card rounded-lg flex flex-col gap-4 md:gap-6">
                <Atoms.Typography size="md" className="text-base font-bold text-card-foreground leading-none">
                  Export to Pubky Ring
                </Atoms.Typography>
                <Image
                  src="/images/keyring.png"
                  alt="Keys"
                  width={112}
                  height={112}
                  className="self-center w-16 h-16 md:w-28 md:h-28"
                />
                <Molecules.DialogExport mnemonic={mnemonic} />
              </Atoms.Card>
            </Atoms.Container>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
