import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import React from 'react';
import type { HumanSelectionProps } from './HumanSelection.types';

export const HumanSelection = ({ onClick, onDevMode }: HumanSelectionProps) => {
  // Show dev mode options if in development mode or Cypress is running (for E2E tests)
  const isCypressRunning = typeof window !== 'undefined' && 'Cypress' in window;
  const isDevMode = process.env.NODE_ENV === 'development' || isCypressRunning;
  return (
    <React.Fragment>
      <Atoms.PageHeader>
        <Molecules.PageTitle size="large">
          Prove <span className="text-brand">you&apos;re not a Robot.</span>
        </Molecules.PageTitle>
        <Atoms.PageSubtitle>
          No email needed. Verify quickly using SMS or a small payment.
        </Atoms.PageSubtitle>
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
            <Atoms.Button
              data-testid="human-dev-skip-btn"
              variant="secondary"
              onClick={() => onDevMode('skip')}
              className=""
            >
              Skip
            </Atoms.Button>
            <Atoms.Button
              data-testid="human-dev-invite-code-btn"
              variant="secondary"
              onClick={() => onDevMode('inviteCode')}
              className=""
            >
              Enter invite code
            </Atoms.Button>
          </Atoms.Container>
        </Atoms.Container>
      )}
      <Molecules.HumanFooter />
    </React.Fragment>
  );
};
