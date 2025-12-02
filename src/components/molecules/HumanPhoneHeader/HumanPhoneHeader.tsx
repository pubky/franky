import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export const HumanPhoneHeader = () => {
  return (
    <Atoms.PageHeader className="gap-2 lg:gap-3" data-testid="human-header">
      <Molecules.PageTitle size="large" className="leading-none font-semibold tracking-tight">
        Proof of <span className="text-brand">Phone.</span>
      </Molecules.PageTitle>
      <Atoms.PageSubtitle className="max-w-3xl text-muted-foreground">
        We will send you a verification code via SMS to your phone number.
      </Atoms.PageSubtitle>
    </Atoms.PageHeader>
  );
};
