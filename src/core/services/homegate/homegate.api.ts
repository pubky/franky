import { HOMEGATE_URL } from '@/config';

/**
 * Homegate API Endpoints
 *
 * All API endpoints related to Homegate operations
 */

/**
 * Builds a full Homegate API URL from a relative endpoint path
 * @param endpoint - The relative endpoint path (e.g., '/sms_verification/send_code')
 * @returns Full Homegate URL
 */
function buildHomegateUrl(endpoint: string): string {
  return new URL(endpoint, HOMEGATE_URL).toString();
}

export const homegateApi = {
  /**
   * Sends a SMS verification code to a phone number
   */
  sendSmsCode: () => buildHomegateUrl('/sms_verification/send_code'),

  /**
   * Validates a SMS verification code
   */
  validateSmsCode: () => buildHomegateUrl('/sms_verification/validate_code'),

  /**
   * Gets the configured price for Lightning Network verification
   */
  getLnVerificationPrice: () => buildHomegateUrl('/ln_verification/price'),

  /**
   * Creates a new Lightning Network verification request
   */
  createLnVerification: () => buildHomegateUrl('/ln_verification'),

  /**
   * Gets the status of a Lightning Network verification by verification ID
   * @param verificationId - The verification ID (UUID format)
   */
  getLnVerification: (verificationId: string) => buildHomegateUrl(`/ln_verification/${verificationId}`),

  /**
   * Long-polls for Lightning Network verification confirmation
   * @param verificationId - The verification ID (UUID format)
   */
  awaitLnVerification: (verificationId: string) => buildHomegateUrl(`/ln_verification/${verificationId}/await`),
};

export type HomegateApiEndpoint = keyof typeof homegateApi;
