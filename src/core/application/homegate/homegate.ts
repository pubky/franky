/**
 * Mock sleep function
 * @param ms
 * @returns
 */
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type TVerifySmsCodeResult = {
  /**
   * True if the code is valid, false otherwise.
   */
  valid: boolean;
  /**
   * The invite code to use for the user. Only set if the code is valid.
   */
  inviteCode?: string;
  /**
   * The reason the code is invalid, if any. Only set if the code is invalid.
   */
  error?: string;
};

/**
 * Homegate application class.
 * Responsible for handing out invite codes to users
 * in exchange for a human proof.
 * Possible proofs:
 * - SMS verification
 * - Payment
 */
export class Homegate {
  private constructor() {} // Prevent instantiation

  /**
   * Sends a SMS code to the user. This only errors on network errors.
   * Any phone number is valid to avoid user enumeration.
   * @param phoneNumber - The phone number to send the SMS code to.
   * @returns undefined
   */
  static async sendSmsCode(phoneNumber: string): Promise<undefined> {
    await sleep(1000); // Mock sleep for 1 second
    console.log('mock sendSmsCode', phoneNumber);
  }

  /**
   * Verifies a SMS code for a given phone number.
   * @param phoneNumber - The phone number to verify the SMS code for.
   * @param code - The code to verify.
   * @returns The result of the verification.
   */
  static async verifySmsCode(phoneNumber: string, code: string): Promise<TVerifySmsCodeResult> {
    await sleep(1000); // Mock sleep for 1 second
    console.log('mock verifySmsCode', phoneNumber, code);

    return {
      valid: true,
      inviteCode: '1VJP-P9HQ-CJYA',
      error: undefined,
    };
  }
}
