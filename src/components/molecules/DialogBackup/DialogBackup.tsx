import * as Atoms from '@/atoms';
import Image from 'next/image';

export function DialogBackup() {
  return (
    <Atoms.Dialog>
      <Atoms.DialogTrigger asChild>
        <Atoms.Button variant="outline" className="text-primary-foreground hover:text-primary-foreground">
          Backup
        </Atoms.Button>
      </Atoms.DialogTrigger>
      <Atoms.DialogContent className="sm:max-w-xl gap-0">
        <Atoms.DialogHeader className="pr-6">
          <Atoms.DialogTitle>Back up your pubky</Atoms.DialogTitle>
        </Atoms.DialogHeader>
        <Atoms.Container className="h-full pr-4 overflow-y-auto">
          <Atoms.Container className="gap-4">
            <Atoms.Typography size="sm" className="text-muted-foreground font-medium">
              Safely back up and store the secret seed for your pubky. Which backup method do you prefer? You can choose
              multiple backup methods if you wish.
            </Atoms.Typography>
            <Atoms.Container className="w-full flex md:flex-row flex-col gap-3">
              <Atoms.Card className="w-full p-6 bg-card rounded-lg flex flex-col gap-6">
                <Atoms.Typography size="md" className="text-base font-bold text-card-foreground leading-none">
                  Recovery phrase
                </Atoms.Typography>
                <Image src="/images/note.png" alt="Note" width={112} height={112} className="self-center" />
                <Atoms.Button>Continue</Atoms.Button>
              </Atoms.Card>
              <Atoms.Card className="w-full p-6 bg-card rounded-lg flex flex-col gap-6">
                <Atoms.Typography size="md" className="text-base font-bold text-card-foreground leading-none">
                  Download encrypted file
                </Atoms.Typography>
                <Image src="/images/folder.png" alt="Folder" width={112} height={112} className="self-center" />
                <Atoms.Button>Continue</Atoms.Button>
              </Atoms.Card>
              <Atoms.Card className="w-full p-6 bg-card rounded-lg flex flex-col gap-6">
                <Atoms.Typography size="md" className="text-base font-bold text-card-foreground leading-none">
                  Export to Pubky Ring
                </Atoms.Typography>
                <Image src="/images/keyring.png" alt="Keys" width={112} height={112} className="self-center" />
                <Atoms.Button>Continue</Atoms.Button>
              </Atoms.Card>
            </Atoms.Container>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
