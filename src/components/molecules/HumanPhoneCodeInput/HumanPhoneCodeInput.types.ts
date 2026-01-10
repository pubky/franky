export interface HumanPhoneCodeInputProps {
  /**
   * Current verification code as an array of digits.
   */
  value: string[];
  /**
   * Callback fired when the code changes.
   */
  onChange: (value: string[]) => void;

  /**
   * Callback fired when the user presses enter and the code is complete.
   */
  onEnter?: () => void;
}
