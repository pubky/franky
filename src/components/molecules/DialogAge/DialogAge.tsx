import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export function DialogAge({ linkText = 'Privacy Policy' }: { linkText?: string }) {
  return (
    <Molecules.Dialog>
      <Molecules.DialogTrigger asChild>
        <Atoms.Link href="#" className="text-brand">
          {linkText}
        </Atoms.Link>
      </Molecules.DialogTrigger>
      <Molecules.DialogContent className="sm:max-w-xl">
        <Molecules.DialogHeader className="pr-6">
          <Molecules.DialogTitle>Age minimum: 18</Molecules.DialogTitle>
        </Molecules.DialogHeader>
        <Atoms.Container className="h-full pr-4 overflow-y-auto">
          <Atoms.Container className="gap-4">
            <Atoms.Typography size="sm" className="text-muted-foreground">
              You can only use Pubky if you are over 18 years old.
            </Atoms.Typography>
          </Atoms.Container>
        </Atoms.Container>
      </Molecules.DialogContent>
    </Molecules.Dialog>
  );
}
