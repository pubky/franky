import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export const HumanHeader = () => {
  return (
    <Atoms.PageHeader className="gap-2 lg:gap-3" data-testid="human-header">
      <Molecules.PageTitle size="large" className="leading-none font-semibold tracking-tight">
        Proof of <span className="text-brand">Human.</span>
      </Molecules.PageTitle>
      <Atoms.PageSubtitle className="max-w-3xl text-muted-foreground">
        Prove your humanity. This keeps the arena real and fair for everyone.
      </Atoms.PageSubtitle>
    </Atoms.PageHeader>
  );
};
