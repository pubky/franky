'use client';

import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ONBOARDING_ROUTES } from '@/app';
import React from 'react';

enum States {
  Selection = 'selection',
  PhoneInput = 'phoneInput',
  PhoneCode = 'phoneCode',
  Payment = 'payment',
  InviteCode = 'inviteCode',
}

export function Human() {
  const [state, setState] = useState<States>(States.Selection);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const { setInviteCode, reset } = Core.useOnboardingStore();
  const router = useRouter();

  React.useEffect(() => {
    reset();
  }, [reset]);

  function onSuccess(inviteCode: string) {
    setInviteCode(inviteCode);
    router.push(ONBOARDING_ROUTES.INSTALL);
  }
  return (
    <Molecules.OnboardingLayout testId="human-content">
      {state === States.Selection && (
        <Organisms.HumanSelection
          onClick={(card) => {
            if (card === 'sms') {
              setState(States.PhoneInput);
            } else if (card === 'payment') {
              setState(States.Payment);
            }
          }}
          onDevMode={async (variant) => {
            if (variant === 'inviteCode') {
              setState(States.InviteCode);
            } else if (variant === 'skip') {
              try {
                const code = await Core.AuthController.generateSignupToken();
                onSuccess(code);
              } catch (error) {
                Libs.Logger.error('[Human] Failed to generate signup token:', error);
              }
            }
          }}
        />
      )}
      {state === States.PhoneInput && (
        <Organisms.HumanPhoneInput
          initialPhoneNumber={phoneNumber}
          onBack={() => setState(States.Selection)}
          onCodeSent={(phoneNum) => {
            setPhoneNumber(phoneNum);
            setState(States.PhoneCode);
          }}
        />
      )}
      {state === States.PhoneCode && (
        <Organisms.HumanPhoneCode
          phoneNumber={phoneNumber!}
          onBack={() => setState(States.PhoneInput)}
          onSuccess={onSuccess}
        />
      )}
      {state === States.Payment && (
        <Organisms.HumanLightningPayment onBack={() => setState(States.Selection)} onSuccess={onSuccess} />
      )}
      {state === States.InviteCode && (
        <Organisms.HumanInviteCode onBack={() => setState(States.Selection)} onSuccess={onSuccess} />
      )}
    </Molecules.OnboardingLayout>
  );
}
