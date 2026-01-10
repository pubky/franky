import parsePhoneNumberFromString, { PhoneNumber } from 'libphonenumber-js/mobile';

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
