'use client';

import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import React, { useState } from 'react';
import type { HumanPhoneInputProps } from './HumanPhoneInput.types';

export const HumanPhoneInput = ({ onBack, onCodeSent, initialPhoneNumber }: HumanPhoneInputProps) => {
  const [phoneNumberInput, setPhoneNumberInput] = useState(initialPhoneNumber || '');
  const [isSendingCode, setIsSendingCode] = useState(false);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumberInput(e.target.value);
  };

  const isValidNumber = !!Libs.parsePhoneNumber(phoneNumberInput);

  async function onSendCode(phoneNumber: string) {
    if (isSendingCode) {
      return;
    }

    try {
      setIsSendingCode(true);
      const result = await Core.HomegateController.sendSmsCode(phoneNumber);

      if (!result.success) {
        if (result.errorType === 'blocked') {
          Molecules.toast.error('Phone number blocked', {
            description: 'This phone number cannot be used for verification.',
          });
        } else if (result.errorType === 'rate_limited') {
          Molecules.toast.error('Too many verification attempts', {
            description: 'You have reached the maximum number of verifications for this phone number.',
          });
        } else {
          Molecules.toast.error('Failed to send SMS code', {
            description: 'Please try again later. If the problem persists, please contact support.',
          });
        }
        return;
      }

      onCodeSent(phoneNumber);
    } catch {
      Molecules.toast.error('Failed to send SMS code', {
        description: 'Please try again later. If the problem persists, please contact support.',
      });
    } finally {
      setIsSendingCode(false);
    }
  }

  return (
    <React.Fragment>
      <Atoms.PageHeader>
        <Molecules.PageTitle size="large">
          Proof of <span className="text-brand">Phone.</span>
        </Molecules.PageTitle>
        <Atoms.PageSubtitle>We will send you a verification code via SMS to your phone number.</Atoms.PageSubtitle>
      </Atoms.PageHeader>
      <Molecules.HumanPhoneInputField
        value={phoneNumberInput}
        onChange={handlePhoneNumberChange}
        isValid={isValidNumber}
        onEnter={() => isValidNumber && onSendCode(phoneNumberInput)}
      />
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
          disabled={!isValidNumber || isSendingCode}
          onClick={() => isValidNumber && onSendCode(phoneNumberInput)}
        >
          <Libs.ArrowRight className="mr-2 h-4 w-4" />
          Send Code
        </Atoms.Button>
      </Atoms.Container>
    </React.Fragment>
  );
};
