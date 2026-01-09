'use client';

import * as Atoms from '@/atoms';
import { HomegateController, THomegateCreateLnVerificationResult } from '@/core';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useBtcRate } from '@/hooks/useSatUsdRate';

/**
 * Simple verification handler that manages the verification process and payment confirmation.
 */
class VerificationHandler {
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
   * If the verification and the lightnign invoice have expired.
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
        throw new Error('Verification not found');
      }
    }
    return undefined;
  }
}

interface HumanLightningPaymentProps {
  onBack: () => void;
  onSuccess: (signupCode: string, homeserverPubky: string) => void;
}

export const HumanLightningPayment = ({ onBack, onSuccess }: HumanLightningPaymentProps) => {
  const [verification, setVerification] = useState<VerificationHandler | null>(null);
  const rate = useBtcRate();
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentExpired, setIsPaymentExpired] = useState(false);
  const { toast } = Molecules.useToast();

  /**
   * Request a new lightning invoice if the verification is expired or not set.
   */
  const requestLightningInvoice = async () => {
    try {
      setIsLoading(true);
      if (verification) {
        verification.abort();
      }
      const onPaymentConfirmed = async (signupCode: string, homeserverPubky: string) => {
        console.log('Payment confirmed', signupCode, homeserverPubky);
        toast({
          title: 'Payment successful',
        });
        onSuccess(signupCode, homeserverPubky);
      };
      const onPaymentExpired = () => {
        setIsPaymentExpired(true);
        toast({
          title: 'Payment expired',
        });
      };
      const client = await VerificationHandler.create(onPaymentConfirmed, onPaymentExpired);
      setVerification(client);
      setIsPaymentExpired(false);
    } catch {
      toast({
        title: 'Failed to request lightning invoice',
        description: 'Please try again later. If the problem persists, please contact support.',
      });
    } finally {
      setIsLoading(false);
    }

    return () => {
      if (verification) {
        verification.abort();
      }
    };
  };

  React.useEffect(() => {
    if (typeof window === 'undefined') return; // No SSR
    if (!verification || verification.isExpired) {
      requestLightningInvoice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run only on mount
  }, []);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Invoice copied to clipboard',
    });
  }

  return (
    <React.Fragment>
      <Atoms.PageHeader>
        <Molecules.PageTitle size="large">
          Scan to <span className="text-brand">Pay.</span>
        </Molecules.PageTitle>
        <Atoms.PageSubtitle>Scan the QR code with your favorite wallet.</Atoms.PageSubtitle>
      </Atoms.PageHeader>

      <Atoms.Card
        data-testid="human-lightning-payment-card"
        className="flex flex-col-reverse items-start gap-6 p-6 md:flex-row lg:gap-12 lg:p-12"
      >
        {/* Payment QR code */}
        <Atoms.Container overrideDefaults={true} className="flex h-full flex-col items-center justify-center">
          {isLoading && (
            <Atoms.Container overrideDefaults={true} className="flex h-[192px] w-[192px] items-center justify-center">
              <Atoms.Spinner size="md" />
            </Atoms.Container>
          )}
          {!isLoading && verification && (
            <React.Fragment>
              {!isPaymentExpired && (
                <Atoms.Container
                  overrideDefaults={true}
                  className="relative flex cursor-pointer items-center justify-center rounded-[9px] bg-white p-[9px]"
                  onClick={() => copyToClipboard(verification.data.bolt11Invoice)}
                >
                  <QRCodeSVG value={verification.data.bolt11Invoice} size={174} />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <Atoms.Image
                      src="/images/bitcoin-logo.svg"
                      alt="Bitcoin logo"
                      width={45}
                      height={45}
                      className=""
                    />
                  </div>
                </Atoms.Container>
              )}
              {isPaymentExpired && (
                <Atoms.Container className="flex h-[192px] w-[192px] items-center justify-center rounded-[9px] bg-secondary p-[9px]">
                  <Atoms.Typography
                    as="p"
                    className="mb-4 text-base leading-6 font-medium text-secondary-foreground/80"
                  >
                    Payment expired
                  </Atoms.Typography>
                  <Atoms.Button
                    size="sm"
                    className="rounded-full font-bold"
                    variant="default"
                    onClick={requestLightningInvoice}
                  >
                    <Libs.RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    New invoice
                  </Atoms.Button>
                </Atoms.Container>
              )}
            </React.Fragment>
          )}
        </Atoms.Container>

        {/* Description */}
        <Atoms.Container className="w-full flex-col gap-3">
          <Atoms.Typography as="h3" className="text-2xl leading-[32px] font-semibold text-foreground">
            Bitcoin Lightning Payment
          </Atoms.Typography>
          <Atoms.Typography as="p" className="text-5xl leading-none font-semibold text-brand lg:text-6xl">
            {verification ? `₿ ${verification.data.amountSat.toLocaleString()}` : '₿ '}
          </Atoms.Typography>
          <Atoms.Typography as="p" className="text-base leading-6 font-medium text-secondary-foreground/80">
            {verification
              ? `Pay ₿ ${verification.data.amountSat.toLocaleString()} ${rate?.satUsd ? `(approximately $${Math.round(rate.satUsd * verification.data.amountSat * 100) / 100})` : ''} to continue.`
              : ''}
          </Atoms.Typography>
        </Atoms.Container>
      </Atoms.Card>

      {/* Buttons container */}
      <Atoms.Container className={Libs.cn('mt-6 flex-row justify-between gap-3 lg:gap-6')}>
        <Atoms.Button
          id="human-phone-back-btn"
          size="lg"
          className="w-full flex-1 rounded-full md:flex-0"
          variant="secondary"
          onClick={onBack}
        >
          <Libs.ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Atoms.Button>
        <Atoms.Button
          id="human-phone-send-code-btn"
          size="lg"
          className="w-full flex-1 rounded-full md:flex-0"
          variant="default"
          disabled={!verification}
          onClick={() => verification && copyToClipboard(verification.data.bolt11Invoice)}
        >
          <Libs.Copy className="mr-2 h-4 w-4" />
          Copy Invoice
        </Atoms.Button>
      </Atoms.Container>
    </React.Fragment>
  );
};
