import {
  TLnVerificationStatus,
  TAwaitLnVerificationResult,
  TCreateLnVerificationResult,
  TVerifySmsCodeResult,
  ISendSmsCodeResult,
  TSmsInfoResult,
  TLnInfoResult,
} from './homegate.types';
import { homegateApi } from './homegate.api';
import { HOMEGATE_QUERY_KEYS } from './homegate.constants';
import { homegateQueryClient } from './homegate.query-client';
import { Logger, createNexusError, NexusErrorType } from '@/libs';

async function logRequestError(response: Response, url: string) {
  let body = undefined;
  try {
    // Clone the response before reading to avoid "Body has already been read" errors
    const clonedResponse = response.clone();
    body = await clonedResponse.text();
    try {
      body = JSON.parse(body);
    } catch {} // Not JSON, use the raw body
  } catch {}

  Logger.error(`Failed to send request to ${url}`, {
    status: response.status,
    statusText: response.statusText,
    body,
  });
  return {
    status: response.status,
    statusText: response.statusText,
    body,
  };
}

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
   * Checks if SMS verification is available for the user's region.
   * Returns available: true if service is accessible, false if geoblocked (403).
   * Uses TanStack Query for caching - the result is cached for 30 minutes.
   * @returns The availability status.
   */
  static async getSmsVerificationInfo(): Promise<TSmsInfoResult> {
    return homegateQueryClient.fetchQuery({
      queryKey: HOMEGATE_QUERY_KEYS.smsVerificationInfo,
      queryFn: async () => {
        const url = homegateApi.getSmsVerificationInfo();
        const response = await fetch(url, { method: 'GET' });

        if (response.ok) {
          return { available: true } as TSmsInfoResult;
        }

        // 403 means geoblocked - not an error, just unavailable
        if (response.status === 403) {
          return { available: false } as TSmsInfoResult;
        }

        await logRequestError(response, url);
        throw createNexusError(
          NexusErrorType.SERVICE_UNAVAILABLE,
          'Failed to get SMS verification info',
          response.status,
          { url, action: 'getSmsVerificationInfo' },
        );
      },
    });
  }

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
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      return { success: true };
    }

    await logRequestError(response, url);

    // Phone number is blocked
    if (response.status === 403) {
      return { success: false, errorType: 'blocked' };
    }

    // Rate limited (weekly/annual limit exceeded)
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      return {
        success: false,
        errorType: 'rate_limited',
        retryAfter: retryAfter ? parseInt(retryAfter) : undefined,
      };
    }

    return { success: false, errorType: 'unknown' };
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
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      const json = await response.json();
      // API returns valid as string "true" or "false"
      const isValid = json.valid === 'true' || json.valid === true;
      return {
        valid: isValid,
        signupCode: json.signupCode,
        homeserverPubky: json.homeserverPubky,
      };
    }
    await logRequestError(response, url);
    throw createNexusError(NexusErrorType.SERVICE_UNAVAILABLE, 'Failed to validate SMS code', response.status, {
      url,
      action: 'verifySmsCode',
    });
  }

  /**
   * Gets LN verification availability and price.
   * Returns available: true with amountSat if service is accessible, false if geoblocked (403).
   * Uses TanStack Query for caching - the result is cached for 30 minutes.
   * @returns The availability status and price if available.
   */
  static async getLnVerificationInfo(): Promise<TLnInfoResult> {
    return homegateQueryClient.fetchQuery({
      queryKey: HOMEGATE_QUERY_KEYS.lnVerificationInfo,
      queryFn: async () => {
        const url = homegateApi.getLnVerificationInfo();
        const response = await fetch(url, { method: 'GET' });

        if (response.ok) {
          const json = await response.json();
          return { available: true, amountSat: json.amountSat } as TLnInfoResult;
        }

        // 403 means geoblocked - not an error, just unavailable
        if (response.status === 403) {
          return { available: false } as TLnInfoResult;
        }

        await logRequestError(response, url);
        throw createNexusError(
          NexusErrorType.SERVICE_UNAVAILABLE,
          'Failed to get Lightning verification info',
          response.status,
          { url, action: 'getLnVerificationInfo' },
        );
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
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const json = await response.json();
      return {
        id: json.id,
        bolt11Invoice: json.bolt11Invoice,
        amountSat: json.amountSat,
        expiresAt: json.expiresAt,
      };
    }

    await logRequestError(response, url);
    throw createNexusError(
      NexusErrorType.SERVICE_UNAVAILABLE,
      'Failed to create Lightning verification',
      response.status,
      { url, action: 'createLnVerification' },
    );
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

    if (response.ok) {
      const json = await response.json();
      return parseLnVerificationStatus(json);
    }

    await logRequestError(response, url);
    throw createNexusError(
      NexusErrorType.SERVICE_UNAVAILABLE,
      'Failed to get Lightning verification status',
      response.status,
      { url, action: 'getLnVerification' },
    );
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
    if (response.ok) {
      const json = await response.json();
      return {
        success: true,
        data: parseLnVerificationStatus(json),
      };
    }

    if (response.status === 408) {
      return { success: false, timeout: true };
    }

    if (response.status === 404) {
      return { success: false, notFound: true };
    }

    await logRequestError(response, url);
    throw createNexusError(
      NexusErrorType.SERVICE_UNAVAILABLE,
      'Failed to await Lightning verification',
      response.status,
      { url, action: 'awaitLnVerification' },
    );
  }
}
