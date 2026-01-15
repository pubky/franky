import {
  TLnVerificationStatus,
  TAwaitLnVerificationResult,
  TCreateLnVerificationResult,
  TVerifySmsCodeParams,
  TVerifySmsCodeResult,
  TSendSmsCodeResult,
  TSmsInfoResult,
  TLnInfoResult,
  TRawApiResponse,
  TAssertValidPaymentHashParams,
} from './homegate.types';
import { homegateApi } from './homegate.api';
import { HOMEGATE_QUERY_KEYS } from './homegate.constants';
import { homegateQueryClient } from './homegate.query-client';
import {
  ErrorService,
  HttpStatusCode,
  JSON_HEADERS,
  httpResponseToError,
  safeFetch,
  parseResponseOrThrow,
  Err,
  ValidationErrorCode,
  HttpMethod,
} from '@/libs';

/** Regex for validating 64-character hex strings (payment hash format) */
const PAYMENT_HASH_REGEX = /^[0-9a-fA-F]{64}$/;

/**
 * Validates that a payment hash is a 64-character hex string.
 * @param params.paymentHash - The payment hash to validate
 * @param params.operation - The operation name for error context
 * @throws AppError with ValidationErrorCode.FORMAT_ERROR if invalid
 */
function assertValidPaymentHash({ paymentHash, operation }: TAssertValidPaymentHashParams): void {
  if (!PAYMENT_HASH_REGEX.test(paymentHash)) {
    throw Err.validation(ValidationErrorCode.FORMAT_ERROR, 'Payment hash must be 64 hex characters', {
      service: ErrorService.Homegate,
      operation,
      context: { paymentHash, expectedFormat: '64 hex characters' },
    });
  }
}

/**
 * Parses a Lightning verification status response from the API.
 */
function parseLnVerificationStatus(json: TRawApiResponse): TLnVerificationStatus {
  return {
    id: json.id as string,
    amountSat: json.amountSat as number,
    expiresAt: json.expiresAt as number,
    isPaid: json.isPaid as boolean,
    signupCode: json.signupCode as string | undefined,
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

        throw httpResponseToError(response, ErrorService.Homegate, 'getSmsVerificationInfo', url);
      },
    });
  }

  /**
   * Sends a SMS code to the user. This only errors on network errors.
   * Any phone number is valid to avoid user enumeration.
   * @param phoneNumber - The phone number to send the SMS code to.
   * @returns The result of the SMS code send request.
   */
  static async sendSmsCode(phoneNumber: string): Promise<TSendSmsCodeResult> {
    const url = homegateApi.sendSmsCode();
    const response = await safeFetch(
      url,
      { method: HttpMethod.POST, body: JSON.stringify({ phoneNumber }), headers: JSON_HEADERS },
      ErrorService.Homegate,
      'sendSmsCode',
    );

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

      return { success: false, errorType: 'unknown', statusCode: response.status };
    }

    return { success: true };
  }

  /**
   * Validates a SMS code for a given phone number.
   * @param params.phoneNumber - The phone number to validate the SMS code for.
   * @param params.code - The code to validate.
   * @returns The result of the validation.
   */
  static async verifySmsCode({ phoneNumber, code }: TVerifySmsCodeParams): Promise<TVerifySmsCodeResult> {
    const url = homegateApi.validateSmsCode();
    const response = await safeFetch(
      url,
      { method: HttpMethod.POST, body: JSON.stringify({ phoneNumber, code }), headers: JSON_HEADERS },
      ErrorService.Homegate,
      'verifySmsCode',
    );

    if (!response.ok) {
      throw httpResponseToError(response, ErrorService.Homegate, 'verifySmsCode', url);
    }

    const { valid, signupCode, homeserverPubky } = await parseResponseOrThrow<TRawApiResponse>(
      response,
      ErrorService.Homegate,
      'verifySmsCode',
      url,
    );

    return {
      // API returns valid as string "true" or "false"
      valid: valid === 'true' || valid === true,
      signupCode: signupCode as string | undefined,
      homeserverPubky: homeserverPubky as string | undefined,
    };
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

        const response = await safeFetch(
          url,
          { method: HttpMethod.GET },
          ErrorService.Homegate,
          'getLnVerificationInfo',
        );
        
        if (response.ok) {
          const json = await response.json();
          return { available: true, amountSat: json.amountSat } as TLnInfoResult;
        }

        if (response.status === 403) {
          return { available: false } as TLnInfoResult;
        }

        throw httpResponseToError(response, ErrorService.Homegate, 'getLnVerificationInfo', url);
      },
    });
  }

  /**
   * Creates a new Lightning Network payment verification request.
   * @returns The verification details including the BOLT11 invoice.
   */
  static async createLnVerification(): Promise<TCreateLnVerificationResult> {
    const url = homegateApi.createLnVerification();
    const response = await safeFetch(
      url,
      { method: HttpMethod.POST, headers: JSON_HEADERS },
      ErrorService.Homegate,
      'createLnVerification',
    );

    if (!response.ok) {
      throw httpResponseToError(response, ErrorService.Homegate, 'createLnVerification', url);
    }

    const { id, bolt11Invoice, amountSat, expiresAt } = await parseResponseOrThrow<TRawApiResponse>(
      response,
      ErrorService.Homegate,
      'createLnVerification',
      url,
    );
    return {
      id: id as string,
      bolt11Invoice: bolt11Invoice as string,
      amountSat: amountSat as number,
      expiresAt: expiresAt as number,
    };
  }

  /**
   * Gets the current status of a Lightning Network payment verification.
   * @param paymentHash - The payment hash (64 hex characters) from createLnVerification.
   * @returns The verification status.
   */
  static async getLnVerification(paymentHash: string): Promise<TLnVerificationStatus> {
    assertValidPaymentHash({ paymentHash, operation: 'getLnVerification' });
    const url = homegateApi.getLnVerification(paymentHash);
    const response = await safeFetch(url, { method: HttpMethod.GET }, ErrorService.Homegate, 'getLnVerification');

    if (!response.ok) {
      throw httpResponseToError(response, ErrorService.Homegate, 'getLnVerification', url);
    }

    const json = await parseResponseOrThrow<TRawApiResponse>(response, ErrorService.Homegate, 'getLnVerification', url);
    return parseLnVerificationStatus(json);
  }

  /**
   * Long-polling endpoint that waits for a Lightning Network payment to be confirmed.
   * Returns immediately if payment is already confirmed, otherwise waits up to 60 seconds.
   * @param paymentHash - The payment hash (64 hex characters) from createLnVerification.
   * @returns The result of awaiting the verification.
   */
  static async awaitLnVerification(paymentHash: string): Promise<TAwaitLnVerificationResult> {
    assertValidPaymentHash({ paymentHash, operation: 'awaitLnVerification' });
    const url = homegateApi.awaitLnVerification(paymentHash);
    const response = await safeFetch(url, { method: HttpMethod.GET }, ErrorService.Homegate, 'awaitLnVerification');

    if (!response.ok) {
      // Domain-specific handling: 408 timeout and 404 not found return result objects
      if (response.status === HttpStatusCode.REQUEST_TIMEOUT) {
        return { success: false, timeout: true };
      }

      if (response.status === HttpStatusCode.NOT_FOUND) {
        return { success: false, notFound: true };
      }

      throw httpResponseToError(response, ErrorService.Homegate, 'awaitLnVerification', url);
    }

    const json = await parseResponseOrThrow<TRawApiResponse>(
      response,
      ErrorService.Homegate,
      'awaitLnVerification',
      url,
    );
    return {
      success: true,
      data: parseLnVerificationStatus(json),
    };
  }
}
