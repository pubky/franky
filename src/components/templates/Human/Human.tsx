'use client';

import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import { useState } from 'react';

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

  function onSuccess(inviteCode: string) {
    console.log('inviteCode', inviteCode);
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
            } else if (card === 'inviteCode') {
              setState(States.InviteCode);
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
