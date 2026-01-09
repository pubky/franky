import type React from 'react';

export interface HumanPhoneInputProps {
  /**
   * Current phone number value (including country code).
   * Example: "+316XXXXXXXX"
   */
  value: string;
  /**
   * Callback fired when the phone number input changes.
   */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Optional placeholder text for the input field.
   */
  placeholder?: string;

  /**
   * Whether to show the validation checkmark.
   */
  isValid?: boolean;

  onEnter?: () => void;
}
