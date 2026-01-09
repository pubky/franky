import { HomegateController, THomegateCreateLnVerificationResult } from '@/core';

/**
 * Simple verification handler that manages the verification process and payment confirmation.
 */
export class VerificationHandler {
  public aborted = false;
  private paymentExpiredTimeout: NodeJS.Timeout | null = null;
  private constructor(
    public data: THomegateCreateLnVerificationResult,
    public onPaymentConfirmed: (signupCode: string, homeserverPubky: string) => void,
    public onPaymentExpired: () => void,
  ) {}

  /**
   * Create a new verification handler.
   * @param onPaymentConfirmed Callback for when the payment is confirmed.
   * @param onPaymentExpired Callback for when the payment expires.
   * @returns The verification handler.
   */
  public static async create(
    onPaymentConfirmed: (signupCode: string, homeserverPubky: string) => void,
    onPaymentExpired: () => void,
  ): Promise<VerificationHandler> {
    const result = await HomegateController.createLnVerification();
    const client = new VerificationHandler(result, onPaymentConfirmed, onPaymentExpired);
    client.listenPaymentConfirmed(); // Fire and forget
    client.listenPaymentExpired(); // Fire and forget
    return client;
  }

  /**
   * If the verification and the lightning invoice have expired.
   */
  get isExpired(): boolean {
    return this.data.expiresAt < Date.now();
  }

  /**
   * Abort the verification polling.
   */
  public abort(): void {
    this.aborted = true;
    if (this.paymentExpiredTimeout) {
      clearTimeout(this.paymentExpiredTimeout);
    }
  }

  /**
   * Listen for the payment expiration.
   */
  private listenPaymentExpired() {
    if (this.paymentExpiredTimeout) {
      clearTimeout(this.paymentExpiredTimeout);
    }

    this.paymentExpiredTimeout = setTimeout(() => {
      this.onPaymentExpired?.();
    }, this.data.expiresAt - Date.now());
  }

  /**
   * Long-polling endpoint that waits for a Lightning Network payment to be confirmed.
   * Returns immediately if payment is already confirmed, undefined if the verification has expired or the polling has been aborted.
   * @returns The signup code and homeserver public key if the payment is successful, undefined if the verification has expired or the payment has not been confirmed yet.
   */
  private async listenPaymentConfirmed() {
    while (!this.aborted) {
      if (this.isExpired) {
        return undefined;
      }
      const result = await HomegateController.awaitLnVerification(this.data.id);
      if (result.success && result.data.isPaid && result.data.signupCode && !this.aborted) {
        this.onPaymentConfirmed?.(result.data.signupCode, result.data.homeserverPubky);
        return;
      }
      if ('timeout' in result && result.timeout) {
        // Try again
        continue;
      }
      if ('notFound' in result && result.notFound) {
        // Verification not found - stop polling (this shouldn't happen in normal flow)
        return undefined;
      }
    }
    return undefined;
  }
}
