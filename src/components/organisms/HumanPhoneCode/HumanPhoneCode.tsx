'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import React, { useState } from 'react';

interface HumanPhoneCodeProps {
  phoneNumber: string;
  onBack: () => void;
  onSuccess: (inviteCode: string) => void;
}

export const HumanPhoneCode = ({ phoneNumber, onBack, onSuccess }: HumanPhoneCodeProps) => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const { toast } = Molecules.useToast();

  // Verify the code
  async function onVerifyCode() {
    // const codeValue = code.join('');

    toast({
      title: 'Verification Code Valid',
    });

    // If successful, call onSuccess
    const inviteCode = '1VJP-P9HQ-CJYA';
    onSuccess(inviteCode);
  }

  const isCodeComplete = code.every((digit) => digit !== '') && code.join('').length === 6;

  return (
    <React.Fragment>
      {/* Header */}
      <Atoms.PageHeader className="gap-2 lg:gap-3" data-testid="human-header">
        <Molecules.PageTitle size="large" className="leading-none font-semibold tracking-tight">
          Enter <span className="text-brand">Code.</span>
        </Molecules.PageTitle>
        <Atoms.PageSubtitle className="max-w-3xl text-muted-foreground">
          We sent a 6-digit verification code to {phoneNumber}.
        </Atoms.PageSubtitle>
      </Atoms.PageHeader>

      {/* Verification code card */}
      <Atoms.Card
        data-testid="human-phone-code-card"
        className="mt-6 gap-0 rounded-md border border-border/60 bg-card p-12 text-card-foreground shadow-sm"
      >
        <Atoms.Container className="flex-col gap-12 lg:flex-row lg:items-start">
          {/* Phone image */}
          <Atoms.Container className="flex h-full w-full items-center lg:w-auto">
            <Atoms.Image
              priority={true}
              src="/images/sms-verification-phone.png"
              alt="Pubky phone representing phone verification"
              className="h-auto w-[192px] max-w-full"
            />
          </Atoms.Container>

          {/* Content section */}
          <Atoms.Container className="w-full flex-1 flex-col gap-6">
            {/* Card header */}
            <Atoms.Container className="flex-col gap-3">
              <Atoms.Typography as="h3" className="text-2xl leading-[32px] font-semibold text-foreground">
                Verification code
              </Atoms.Typography>
              <Atoms.Typography as="p" className="text-base leading-6 font-medium text-muted-foreground/80">
                Enter the code you received on {phoneNumber}.
              </Atoms.Typography>
            </Atoms.Container>

            <Molecules.HumanPhoneCodeInput
              value={code}
              onChange={setCode}
              onEnter={() => isCodeComplete && onVerifyCode()}
            />
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.Card>

      {/* Buttons */}
      <Atoms.Container className={Libs.cn('mt-6 flex-row justify-between gap-3 lg:gap-6')}>
        <Atoms.Button
          id="human-phone-back-btn"
          size="lg"
          className="w-full flex-1 rounded-full md:flex-0"
          variant="secondary"
          onClick={onBack}
        >
          <Libs.ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Atoms.Button>
        <Atoms.Button
          id="human-phone-send-code-btn"
          size="lg"
          className="w-full flex-1 rounded-full md:flex-0"
          variant="default"
          disabled={!isCodeComplete}
          onClick={() => isCodeComplete && onVerifyCode()}
        >
          <Libs.ArrowRight className="mr-2 h-4 w-4" />
          Verify Code
        </Atoms.Button>
      </Atoms.Container>
    </React.Fragment>
  );
};
