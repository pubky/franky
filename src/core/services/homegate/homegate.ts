import {
  TLnVerificationStatus,
  TAwaitLnVerificationResult,
  TCreateLnVerificationResult,
  TGetPriceResult,
  TVerifySmsCodeResult,
  ISendSmsCodeResult,
} from './homegate.types';
import { homegateApi } from './homegate.api';
import { homegateQueryClient } from './homegate.query-client';
import { ErrorService, HttpStatusCode, JSON_HEADERS, fromHttpResponse } from '@/libs';

/**
 * Parses a Lightning verification status response from the API.
 */
function parseLnVerificationStatus(json: Record<string, unknown>): TLnVerificationStatus {
  return {
    id: json.id as string,
    amountSat: json.amountSat as number,
    expiresAt: json.expiresAt as number,
    isPaid: json.isPaid as boolean,
    signupCode: (json.signupCode as string | undefined) ?? undefined,
    homeserverPubky: json.homeserverPubky as string,
    createdAt: json.createdAt as number,
  };
}

/**
 * Homegate service class.
 * Responsible for handing out invite codes to users
 * in exchange for a human proof.
 * Possible proofs:
 * - SMS verification
 * - Payment
 */
export class HomegateService {
  private constructor() {} // Prevent instantiation

  /**
   * Sends a SMS code to the user. This only errors on network errors.
   * Any phone number is valid to avoid user enumeration.
   * @param phoneNumber - The phone number to send the SMS code to.
   * @returns The result of the SMS code send request.
   */
  static async sendSmsCode(phoneNumber: string): Promise<ISendSmsCodeResult> {
    const url = homegateApi.sendSmsCode();
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
      headers: JSON_HEADERS,
    });

    if (!response.ok) {
      // Phone number is blocked
      if (response.status === HttpStatusCode.FORBIDDEN) {
        return { success: false, errorType: 'blocked' };
      }

      // Rate limited (weekly/annual limit exceeded)
      if (response.status === HttpStatusCode.TOO_MANY_REQUESTS) {
        const retryAfter = response.headers.get('retry-after');
        return {
          success: false,
          errorType: 'rate_limited',
          retryAfter: retryAfter ? parseInt(retryAfter) : undefined,
        };
      }

      return { success: false, errorType: 'unknown' };
    }

    return { success: true };
  }

  /**
   * Validates a SMS code for a given phone number.
   * @param phoneNumber - The phone number to validate the SMS code for.
   * @param code - The code to validate.
   * @returns The result of the validation.
   */
  static async verifySmsCode(phoneNumber: string, code: string): Promise<TVerifySmsCodeResult> {
    const url = homegateApi.validateSmsCode();
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, code }),
      headers: JSON_HEADERS,
    });

    if (!response.ok) {
      throw fromHttpResponse(response, ErrorService.Homegate, 'verifySmsCode', url);
    }

    const json = await response.json();
    // API returns valid as string "true" or "false"
    const isValid = json.valid === 'true' || json.valid === true;
    return {
      valid: isValid,
      signupCode: json.signupCode,
      homeserverPubky: json.homeserverPubky,
    };
  }

  /**
   * Gets the configured price in satoshis for Lightning Network verification.
   * Uses TanStack Query for caching - the price is cached for 30 minutes.
   * @returns The price in satoshis.
   */
  static async getLnVerificationPrice(): Promise<TGetPriceResult> {
    return homegateQueryClient.fetchQuery({
      queryKey: ['homegate', 'ln-verification-price'],
      queryFn: async () => {
        const url = homegateApi.getLnVerificationPrice();
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
          throw fromHttpResponse(response, ErrorService.Homegate, 'getLnVerificationPrice', url);
        }

        const json = await response.json();
        return { amountSat: json.amountSat };
      },
    });
  }

  /**
   * Creates a new Lightning Network payment verification request.
   * @returns The verification details including the BOLT11 invoice.
   */
  static async createLnVerification(): Promise<TCreateLnVerificationResult> {
    const url = homegateApi.createLnVerification();
    const response = await fetch(url, {
      method: 'POST',
      headers: JSON_HEADERS,
    });

    if (!response.ok) {
      throw fromHttpResponse(response, ErrorService.Homegate, 'createLnVerification', url);
    }

    const json = await response.json();
    return {
      id: json.id,
      bolt11Invoice: json.bolt11Invoice,
      amountSat: json.amountSat,
      expiresAt: json.expiresAt,
    };
  }

  /**
   * Gets the current status of a Lightning Network payment verification.
   * @param paymentHash - The payment hash (64 hex characters) from createLnVerification.
   * @returns The verification status.
   */
  static async getLnVerification(paymentHash: string): Promise<TLnVerificationStatus> {
    const url = homegateApi.getLnVerification(paymentHash);
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw fromHttpResponse(response, ErrorService.Homegate, 'getLnVerification', url);
    }

    const json = await response.json();
    return parseLnVerificationStatus(json);
  }

  /**
   * Long-polling endpoint that waits for a Lightning Network payment to be confirmed.
   * Returns immediately if payment is already confirmed, otherwise waits up to 60 seconds.
   * @param paymentHash - The payment hash (64 hex characters) from createLnVerification.
   * @returns The result of awaiting the verification.
   */
  static async awaitLnVerification(paymentHash: string): Promise<TAwaitLnVerificationResult> {
    const url = homegateApi.awaitLnVerification(paymentHash);
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      // Domain-specific handling: 408 timeout and 404 not found return result objects
      if (response.status === HttpStatusCode.REQUEST_TIMEOUT) {
        return { success: false, timeout: true };
      }

      if (response.status === HttpStatusCode.NOT_FOUND) {
        return { success: false, notFound: true };
      }
      
      throw fromHttpResponse(response, ErrorService.Homegate, 'awaitLnVerification', url);
    }

    const json = await response.json();
    return {
      success: true,
      data: parseLnVerificationStatus(json),
    };
  }
}
