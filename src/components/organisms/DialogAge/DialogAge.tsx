import * as Atoms from '@/atoms';

export function DialogAge(): React.ReactElement {
  return (
    <Atoms.Dialog>
      <Atoms.DialogTrigger asChild>
        <Atoms.Typography as="span" size="sm" className="cursor-pointer font-medium text-brand">
          over 18 years old.
        </Atoms.Typography>
      </Atoms.DialogTrigger>
      <Atoms.DialogContent className="sm:max-w-xl" hiddenTitle="Age minimum: 18">
        <Atoms.DialogHeader className="pr-6">
          <Atoms.DialogTitle>Age minimum: 18</Atoms.DialogTitle>
        </Atoms.DialogHeader>
        <Atoms.Container className="h-full overflow-y-auto pr-4">
          <Atoms.Container className="gap-4">
            <Atoms.Typography size="sm" className="font-normal text-muted-foreground">
              You can only use Pubky if you are over 18 years old.
            </Atoms.Typography>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
