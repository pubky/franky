import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import React from 'react';

interface HumanSelectionProps {
  onClick: (card: 'sms' | 'payment') => void;
}

export const HumanSelection = ({ onClick }: HumanSelectionProps) => {
  return (
    <React.Fragment>
      <Molecules.HumanHeader />
      <Atoms.Container data-testid="human-verification-cards" className="gap-6 lg:flex-row lg:items-stretch lg:gap-8">
        <Molecules.HumanSmsCard onClick={() => onClick('sms')} />
        <Molecules.HumanBitcoinCard onClick={() => onClick('payment')} />
      </Atoms.Container>
      <Molecules.HumanFooter />
    </React.Fragment>
  );
};
