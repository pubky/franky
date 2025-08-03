import * as Atoms from '@/atoms';

export function DialogAge() {
  return (
    <Atoms.Dialog>
      <Atoms.DialogTrigger asChild>
        <Atoms.Link href="#" className="text-brand">
          over 18 years old.
        </Atoms.Link>
      </Atoms.DialogTrigger>
      <Atoms.DialogContent className="sm:max-w-xl">
        <Atoms.DialogHeader className="pr-6">
          <Atoms.DialogTitle>Age minimum: 18</Atoms.DialogTitle>
        </Atoms.DialogHeader>
        <Atoms.Container className="h-full pr-4 overflow-y-auto">
          <Atoms.Container className="gap-4">
            <Atoms.Typography size="sm" className="text-muted-foreground font-normal">
              You can only use Pubky if you are over 18 years old.
            </Atoms.Typography>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
