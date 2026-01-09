'use client';

import * as Atoms from '@/atoms';
import { HomegateController } from '@/core';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import parsePhoneNumberFromString, { PhoneNumber } from 'libphonenumber-js/mobile';
import React, { useState } from 'react';

/**
 * Validates an international phone number in E.164 format.
 * @param phoneNumber - The phone number to validate (e.g., "+316XXXXXXXX")
 * @returns The parsed phone number if valid, undefined otherwise
 */
export function parsePhoneNumber(phoneNumber: string): PhoneNumber | undefined {
  const trimmed = phoneNumber.trim().replaceAll(' ', '');

  // Check if there are any non-digit characters other than the plus sign
  const regex = /^\+(\d)*$/;
  if (!regex.test(trimmed)) {
    return;
  }

  // Use libphonenumber-js to parse and validate the number
  const parsed = parsePhoneNumberFromString(trimmed);

  if (!parsed) {
    return;
  }

  if (!parsed.isValid()) {
    return;
  }

  return parsed;
}

interface HumanPhoneInputProps {
  onBack: () => void;
  onCodeSent: (phoneNumber: string) => void;
  initialPhoneNumber?: string;
}

export const HumanPhoneInput = ({ onBack, onCodeSent, initialPhoneNumber }: HumanPhoneInputProps) => {
  const [phoneNumberInput, setPhoneNumberInput] = useState(initialPhoneNumber || '');
  const [isSendingCode, setIsSendingCode] = useState(false);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumberInput(e.target.value);
  };

  const isValidNumber = !!parsePhoneNumber(phoneNumberInput);

  async function onSendCode(phoneNumber: string) {
    if (isSendingCode) {
      return;
    }

    try {
      setIsSendingCode(true);
      const result = await HomegateController.sendSmsCode(phoneNumber);

      if (!result.success) {
        if (result.errorType === 'blocked') {
          Molecules.toast({
            title: 'Phone number blocked',
            description: 'This phone number cannot be used for verification.',
          });
        } else if (result.errorType === 'rate_limited') {
          Molecules.toast({
            title: 'Too many verification attempts',
            description: 'You have reached the maximum number of verifications for this phone number.',
          });
        } else {
          Molecules.toast({
            title: 'Failed to send SMS code',
            description: 'Please try again later. If the problem persists, please contact support.',
          });
        }
        return;
      }

      onCodeSent(phoneNumber);
    } catch {
      Molecules.toast({
        title: 'Failed to send SMS code',
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
