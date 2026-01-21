'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import React, { useState } from 'react';
import * as Core from '@/core';
import type { HumanInviteCodeProps } from './HumanInviteCode.types';

/**
 * Dev component only, might be removed later.
 * It allows to enter an invite code to continue the onboarding process.
 * @param onBack - Function to call when the user clicks the back button.
 * @param onSuccess - Function to call when the user successfully enters the invite code.
 */
export const HumanInviteCode = ({ onBack, onSuccess }: HumanInviteCodeProps) => {
  const [inviteCode, setInviteCode] = useState('');
  const trimmedInviteCode = inviteCode.trim();
  const isInviteCodeEntered = trimmedInviteCode.length === 14;

  function handleSubmit() {
    if (!isInviteCodeEntered) {
      return;
    }

    onSuccess(trimmedInviteCode);
  }

  // generate an invite code and put it in console log if you are in development mode
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      Core.AuthController.generateSignupToken().then((token) => {
        Libs.Logger.info(token, token);
      });
    }
  }, []);

  return (
    <React.Fragment>
      <Atoms.PageHeader>
        <Molecules.PageTitle size="large">
          Enter an <span className="text-brand">Invite Code.</span>
        </Molecules.PageTitle>
        <Atoms.PageSubtitle>Enter the invite code you received to continue.</Atoms.PageSubtitle>
      </Atoms.PageHeader>

      <Atoms.Card data-testid="human-invite-code-card" className="gap-0 p-6 lg:p-12">
        <Atoms.Container className="flex-col gap-8 lg:flex-row lg:items-center">
          {/* Content */}
          <Atoms.Container className="mr-6 w-full flex-3 gap-6">
            <Atoms.Container className="gap-3">
              <Atoms.Typography
                as="h3"
                className="text-2xl leading-[32px] font-semibold text-foreground sm:text-[28px]"
              >
                Invite code
              </Atoms.Typography>

              <Atoms.Typography as="p" className="text-base leading-6 font-medium text-secondary-foreground/80">
                Paste or type your invite code to continue.
              </Atoms.Typography>
            </Atoms.Container>

            <Atoms.Container className="gap-2">
              <Atoms.Container className="ml-0 flex max-w-128 flex-row items-center rounded-md border border-dashed border-brand px-5 py-2 shadow-xs-dark">
                <Atoms.Input
                  data-cy="human-invite-code-input"
                  type="text"
                  autoFocus
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Enter your invite code"
                  className="border-none bg-transparent text-base font-medium text-brand placeholder:text-brand/50 focus:ring-0 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isInviteCodeEntered) {
                      handleSubmit();
                    }
                  }}
                />
              </Atoms.Container>
            </Atoms.Container>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.Card>

      {/* Buttons container */}
      <Atoms.Container className={Libs.cn('mt-6 flex-row justify-between gap-3 lg:gap-6')}>
        <Atoms.Button
          id="human-invite-back-btn"
          size="lg"
          className="w-full flex-1 rounded-full md:flex-0"
          variant="secondary"
          onClick={onBack}
        >
          <Libs.ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Atoms.Button>
        <Atoms.Button
          id="human-invite-continue-btn"
          data-cy="human-invite-code-continue-btn"
          size="lg"
          className="w-full flex-1 rounded-full md:flex-0"
          variant="default"
          disabled={!isInviteCodeEntered}
          onClick={handleSubmit}
        >
          <Libs.ArrowRight className="mr-2 h-4 w-4" />
          Continue
        </Atoms.Button>
      </Atoms.Container>
    </React.Fragment>
  );
};
