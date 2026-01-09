import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import React from 'react';

interface HumanSelectionProps {
  onClick: (card: 'sms' | 'payment') => void;
  // Callback to be called when the user clicks the dev mode options
  // These are only available in development mode
  // - inviteCode: Enter an invite code to continue the onboarding process
  // - skipHumanProof: Skip the human proof and continue the onboarding process
  onDevMode: (variant: 'inviteCode' | 'skip') => void;
}

export const HumanSelection = ({ onClick, onDevMode }: HumanSelectionProps) => {
  const isDevMode = process.env.NODE_ENV === 'development'; // Show dev mode options if in development mode
  return (
    <React.Fragment>
      <Atoms.PageHeader>
        <Molecules.PageTitle size="large">
          Proof of <span className="text-brand">Human.</span>
        </Molecules.PageTitle>
        <Atoms.PageSubtitle>Prove your humanity. This keeps the arena real and fair for everyone.</Atoms.PageSubtitle>
      </Atoms.PageHeader>

      <Atoms.Container data-testid="human-verification-cards" className="gap-6 lg:flex-row lg:items-stretch lg:gap-8">
        <Molecules.HumanSmsCard onClick={() => onClick('sms')} />
        <Organisms.HumanBitcoinCard onClick={() => onClick('payment')} />
      </Atoms.Container>
      {isDevMode && (
        <Atoms.Container className="relative mt-6 flex items-start rounded border px-4 py-6">
          <Atoms.Typography
            as="p"
            className="absolute top-[-14px] left-[-6px] ml-4 bg-background px-2 text-base leading-6 font-medium text-secondary-foreground/80"
          >
            Dev Mode
          </Atoms.Typography>
          <Atoms.Container className="flex flex-row gap-2">
            <Atoms.Button variant="secondary" onClick={() => onDevMode('skip')} className="">
              Skip
            </Atoms.Button>
            <Atoms.Button variant="secondary" onClick={() => onDevMode('inviteCode')} className="">
              Enter invite code
            </Atoms.Button>
          </Atoms.Container>
        </Atoms.Container>
      )}
      <Molecules.HumanFooter />
    </React.Fragment>
  );
};
