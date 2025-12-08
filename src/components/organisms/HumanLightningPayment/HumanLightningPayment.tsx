'use client';

import * as Atoms from '@/atoms';
import { Homegate } from '@/core/application/homegate';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useBtcRate } from '@/hooks/useSatUsdRate';

interface HumanLightningPaymentProps {
  onBack: () => void;
  onSuccess: (inviteCode: string) => void;
}

export const HumanLightningPayment = ({ onBack, onSuccess }: HumanLightningPaymentProps) => {
  const [invoice, setInvoice] = useState('');
  const rate = useBtcRate();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = Molecules.useToast();

  async function requestLightningInvoice() {
    try {
      setIsLoading(true);
      const invoice = await Homegate.requestLightningInvoice();
      setInvoice(invoice);
    } catch (error) {
      console.error('Failed to request lightning invoice', error);
      toast({
        title: 'Failed to request lightning invoice',
        description: 'Please try again later. If the problem persists, please contact support.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onPaid() {
    toast({
      title: 'Payment successful',
    });
    onSuccess('1234567890');
  }

  React.useEffect(() => {
    if (window === undefined) return; // No SSR
    requestLightningInvoice();
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
          {!isLoading && (
            <Atoms.Container
              overrideDefaults={true}
              className="relative flex cursor-pointer items-center justify-center rounded-[9px] bg-white p-[9px]"
              onClick={() => copyToClipboard(invoice)}
            >
              <QRCodeSVG value={invoice} size={174} />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <Atoms.Image src="/images/bitcoin-logo.svg" alt="Bitcoin logo" width={45} height={45} className="" />
              </div>
            </Atoms.Container>
          )}
        </Atoms.Container>

        {/* Description */}
        <Atoms.Container className="w-full flex-col gap-3">
          <Atoms.Typography as="h3" className="text-2xl leading-[32px] font-semibold text-foreground">
            Bitcoin Lightning Payment
          </Atoms.Typography>
          <Atoms.Typography as="p" className="text-5xl leading-none font-semibold text-brand lg:text-6xl">
            ₿ 1,000
          </Atoms.Typography>
          <Atoms.Typography as="p" className="text-base leading-6 font-medium text-secondary-foreground/80">
            Pay ₿ 1,000 {rate?.satUsd && `(approximately $${Math.round(rate.satUsd * 1000 * 100) / 100})`} to continue.
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
          onClick={() => copyToClipboard(invoice)}
        >
          <Libs.Copy className="mr-2 h-4 w-4" />
          Copy Invoice
        </Atoms.Button>

        <Atoms.Button
          id="human-lightning-payment-on-paid-btn"
          size="lg"
          className="w-full flex-1 rounded-full md:flex-0"
          variant="default"
          onClick={onPaid}
        >
          <Libs.Copy className="mr-2 h-4 w-4" />
          On Paid
        </Atoms.Button>
      </Atoms.Container>
    </React.Fragment>
  );
};
