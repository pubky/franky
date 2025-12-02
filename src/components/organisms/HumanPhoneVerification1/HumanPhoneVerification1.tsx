'use client';

import { useRouter } from 'next/navigation';
import * as App from '@/app';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import parsePhoneNumberFromString, { PhoneNumber } from 'libphonenumber-js/mobile';
import React, { useState } from 'react';

/**
 * Validates an international phone number in E.164 format.
 * @param phoneNumber - The phone number to validate (e.g., "+316XXXXXXXX")
 * @returns The parsed phone number if valid, undefined otherwise
 */
function parsePhoneNumber(phoneNumber: string): PhoneNumber | undefined {
  const trimmed = phoneNumber.trim().replaceAll(" ", "");

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

export const HumanPhoneVerification1 = () => {
  const router = useRouter();
  const [phoneNumberInput, setPhoneNumberInput] = useState('');

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumberInput(e.target.value);
  };

  const isValidNumber = !!parsePhoneNumber(phoneNumberInput);

  const handleBack = () => {
    router.push(App.ONBOARDING_ROUTES.HUMAN);
  };
  const handleSendCode = () => {
    console.log('send code');
  };

  return (
    <React.Fragment>
      <Molecules.HumanPhoneHeader />
      <Molecules.HumanPhoneInput value={phoneNumberInput} onChange={handlePhoneNumberChange} isValid={isValidNumber} />
      <Atoms.Container className={Libs.cn('flex-row justify-between gap-3 lg:gap-6 mt-6')}>
        <Atoms.Button
          id="human-phone-back-btn"
          size="lg"
          className="w-full flex-1 rounded-full md:flex-0"
          variant="secondary"
          onClick={handleBack}
        >
          <Libs.ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Atoms.Button>
        <Atoms.Button
          id="human-phone-send-code-btn"
          size="lg"
          className="w-full flex-1 rounded-full md:flex-0"
          variant="default"
          disabled={!isValidNumber}
          onClick={handleSendCode}
        >
          <Libs.ArrowRight className="mr-2 h-4 w-4" />
          Send Code
        </Atoms.Button>
      </Atoms.Container>
    </React.Fragment>
  );
};
