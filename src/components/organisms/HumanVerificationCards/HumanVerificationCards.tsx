import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export const HumanVerificationCards = () => {
  return (
    <Atoms.Container data-testid="human-verification-cards" className="gap-6 lg:flex-row lg:items-stretch lg:gap-8">
      <Molecules.HumanSmsCard />
      <Molecules.HumanBitcoinCard />
    </Atoms.Container>
  );
};
