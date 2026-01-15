import * as Core from '@/core';
import * as Libs from '@/libs';
import type * as Types from './homegate.types';

/**
 * Homegate application service.
 *
 * Orchestrates homegate workflows:
 * - Lightning Network verification price retrieval
 * - SMS verification
 * - Payment verification
 *
 * This layer is called by the controller and handles business logic orchestration.
 */
export class HomegateApplication {
  private constructor() {}

  /**
   * Generates a signup authentication URL for Pubky Ring App
   *
   * @param inviteCode - The invite code for signup
   * @returns Authentication URL and promise to the generated authentication URL
   */
  static async generateSignupAuthUrl(inviteCode: string): Promise<Core.TGenerateAuthUrlResult> {
    return await Core.HomeserverService.generateSignupAuthUrl({ inviteCode });
  }

  /**
   * Get SMS verification availability info.
   *
   * @returns The availability status
   * @throws AppError if retrieval fails
   */
  static async getSmsVerificationInfo(): Promise<Types.THomegateSmsInfoResult> {
    return await Core.HomegateService.getSmsVerificationInfo();
  }

  /**
   * Get Lightning Network verification availability and price.
   *
   * @returns The availability status and price if available
   * @throws AppError if retrieval fails
   */
  static async getLnVerificationInfo(): Promise<Types.THomegateLnInfoResult> {
    return await Core.HomegateService.getLnVerificationInfo();
  }

  /**
   * Create a new Lightning Network verification request.
   *
   * @returns The verification details including the BOLT11 invoice
   * @throws AppError if creation fails
   */
  static async createLnVerification(): Promise<Types.THomegateCreateLnVerificationResult> {
    try {
      return await Core.HomegateService.createLnVerification();
    } catch (error) {
      if (error instanceof Libs.AppError) {
        Libs.Logger.error('Failed to create LN verification', {
          category: error.category,
          code: error.code,
          service: error.service,
          operation: error.operation,
          context: error.context,
        });
        throw error;
      }

      Libs.Logger.error('Unexpected error creating LN verification', { error });
      throw Libs.Err.server(Libs.ServerErrorCode.UNKNOWN_ERROR, 'Failed to create Lightning verification', {
        service: Libs.ErrorService.Homegate,
        operation: 'createLnVerification',
        cause: error,
      });
    }
  }

  /**
   * Await Lightning Network payment confirmation.
   * Long-polling endpoint that waits for payment to be confirmed.
   *
   * @param paymentHash - The payment hash from createLnVerification
   * @returns The verification result
   * @throws AppError if awaiting fails
   */
  static async awaitLnVerification(paymentHash: string): Promise<Types.THomegateAwaitLnVerificationResult> {
    try {
      return await Core.HomegateService.awaitLnVerification(paymentHash);
    } catch (error) {
      if (error instanceof Libs.AppError) {
        Libs.Logger.error('Failed to await LN verification', {
          category: error.category,
          code: error.code,
          service: error.service,
          operation: error.operation,
          context: error.context,
        });
        throw error;
      }

      Libs.Logger.error('Unexpected error awaiting LN verification', { error });
      throw Libs.Err.server(Libs.ServerErrorCode.UNKNOWN_ERROR, 'Failed to await Lightning verification', {
        service: Libs.ErrorService.Homegate,
        operation: 'awaitLnVerification',
        cause: error,
      });
    }
  }

  /**
   * Verify an SMS code for a given phone number.
   *
   * @param params.phoneNumber - The phone number to verify
   * @param params.code - The SMS code to verify
   * @returns The verification result with signup code if valid
   * @throws AppError if verification fails
   */
  static async verifySmsCode({
    phoneNumber,
    code,
  }: Types.THomegateVerifySmsCodeParams): Promise<Types.THomegateVerifySmsCodeResult> {
    try {
      return await Core.HomegateService.verifySmsCode({ phoneNumber, code });
    } catch (error) {
      if (error instanceof Libs.AppError) {
        Libs.Logger.error('Failed to verify SMS code', {
          category: error.category,
          code: error.code,
          service: error.service,
          operation: error.operation,
          context: error.context,
        });
        throw error;
      }

      Libs.Logger.error('Unexpected error verifying SMS code', { error });
      throw Libs.Err.server(Libs.ServerErrorCode.UNKNOWN_ERROR, 'Failed to verify SMS code', {
        service: Libs.ErrorService.Homegate,
        operation: 'verifySmsCode',
        cause: error,
      });
    }
  }

  /**
   * Send an SMS verification code to a phone number.
   *
   * @param phoneNumber - The phone number to send the code to
   * @returns The result of the SMS send request
   * @throws AppError if sending fails
   */
  static async sendSmsCode(phoneNumber: string): Promise<Types.THomegateSendSmsCodeResult> {
    try {
      return await Core.HomegateService.sendSmsCode(phoneNumber);
    } catch (error) {
      if (error instanceof Libs.AppError) {
        Libs.Logger.error('Failed to send SMS code', {
          category: error.category,
          code: error.code,
          service: error.service,
          operation: error.operation,
          context: error.context,
        });
        throw error;
      }

      Libs.Logger.error('Unexpected error sending SMS code', { error });
      throw Libs.Err.server(Libs.ServerErrorCode.UNKNOWN_ERROR, 'Failed to send SMS code', {
        service: Libs.ErrorService.Homegate,
        operation: 'sendSmsCode',
        cause: error,
      });
    }
  }

  /**
   * Get the current BTC/USD and SAT/USD exchange rate.
   *
   * @returns The BTC rate with satUsd, btcUsd, and lastUpdatedAt
   * @throws AppError if retrieval fails
   */
  static async getBtcRate(): Promise<Core.BtcRate> {
    try {
      return await Core.ExchangerateService.getSatoshiUsdRate();
    } catch (error) {
      if (error instanceof Libs.AppError) {
        Libs.Logger.error('Failed to get BTC rate', {
          category: error.category,
          code: error.code,
          service: error.service,
          operation: error.operation,
          context: error.context,
        });
        throw error;
      }

      Libs.Logger.error('Unexpected error getting BTC rate', { error });
      throw Libs.Err.server(Libs.ServerErrorCode.UNKNOWN_ERROR, 'Failed to get BTC exchange rate', {
        service: Libs.ErrorService.Exchangerate,
        operation: 'getBtcRate',
        cause: error,
      });
    }
  }
}
