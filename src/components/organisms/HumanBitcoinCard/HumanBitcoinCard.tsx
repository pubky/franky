'use client';

import * as Atoms from '@/atoms';
import { useBtcRate } from '@/hooks/useSatUsdRate';
import { useLnVerificationPrice } from '@/hooks/useLnVerificationPrice';
import * as Libs from '@/libs';
import React from 'react';
import type { HumanBitcoinCardProps } from './HumanBitcoinCard.types';

export const HumanBitcoinCard = ({ onClick }: HumanBitcoinCardProps) => {
  const satUsdRate = useBtcRate()?.satUsd;
  const priceSat = useLnVerificationPrice()?.amountSat;
  const dataAvailable = priceSat !== undefined && satUsdRate !== undefined;

  return (
    <Atoms.Card data-testid="bitcoin-payment-card" className="gap-0 p-6 md:p-12">
      <Atoms.Container className="flex-col gap-10 lg:flex-row lg:items-start">
        <Atoms.Container className="hidden w-full flex-1 flex-col items-center gap-3 lg:block lg:w-auto">
          <Atoms.Image
            priority={true}
            src="/images/bitcoin-payment.png"
            alt="Lime Pubky coins representing Bitcoin payments"
            className="h-auto w-[192px] max-w-full"
          />
          <Atoms.Typography
            as="p"
            className="text-center text-xs font-semibold tracking-[0.12em] text-brand uppercase sm:text-left"
          >
            (More private)
          </Atoms.Typography>
        </Atoms.Container>

        <Atoms.Container className="w-full flex-1 gap-6">
          <Atoms.Container className="gap-3">
            <Atoms.Typography
              as="h3"
              className="text-2xl leading-[32px] font-semibold whitespace-nowrap text-foreground sm:text-[28px]"
            >
              Bitcoin Payment
            </Atoms.Typography>

            <Atoms.Typography
              as="p"
              className="text-5xl leading-none font-semibold whitespace-nowrap text-brand lg:text-6xl"
            >
              ₿ {dataAvailable && priceSat!.toLocaleString()}
            </Atoms.Typography>

            <Atoms.Typography as="p" className="text-xs font-medium tracking-[0.1em] text-muted-foreground">
              {dataAvailable ? (
                <React.Fragment>
                  ₿{priceSat!.toLocaleString()} = ${Math.round(satUsdRate * priceSat! * 100) / 100}
                </React.Fragment>
              ) : (
                <br />
              )}
            </Atoms.Typography>

            <Atoms.Container className="gap-1">
              <Atoms.Typography as="p" className="text-base leading-6 font-medium text-secondary-foreground/80">
                1GB storage
              </Atoms.Typography>
              <Atoms.Typography as="p" className="text-base leading-6 font-medium text-secondary-foreground/80">
                1MB/s speed limit
              </Atoms.Typography>
            </Atoms.Container>
          </Atoms.Container>

          <Atoms.Button
            variant={Atoms.ButtonVariant.BRAND}
            className="h-12 w-full rounded-full px-5 py-3 text-sm font-semibold text-background sm:w-auto"
            onClick={onClick}
          >
            <Libs.Wallet className="mr-2 h-4 w-4" />
            Pay Once
          </Atoms.Button>
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Card>
  );
};
