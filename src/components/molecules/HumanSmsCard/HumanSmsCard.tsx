'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { useSmsVerificationInfo } from '@/hooks/useSmsVerificationInfo';
import type { HumanSmsCardProps } from './HumanSmsCard.types';

export const HumanSmsCard = ({ onClick }: HumanSmsCardProps) => {
  const smsInfo = useSmsVerificationInfo();

  // Check if geoblocked (403 response)
  const isGeoblocked = smsInfo !== null && !smsInfo.available;

  return (
    <Atoms.Container className="relative flex-1">
      <Atoms.Card
        data-testid="sms-verification-card"
        className={Libs.cn('flex-1 gap-0 p-6 md:p-12', isGeoblocked && 'pointer-events-none opacity-60 blur-[5px]')}
      >
        <Atoms.Container className="flex-col gap-10 lg:flex-row lg:items-center">
          <Atoms.Container className="flex hidden h-full w-full flex-1 items-center lg:block lg:w-auto">
            <Atoms.Image
              priority={true}
              src="/images/sms-verification-phone.png"
              alt="Lime Pubky phone representing SMS verification"
              className="h-auto w-[192px] max-w-full"
            />
          </Atoms.Container>

          <Atoms.Container className="w-full flex-1 items-start gap-6">
            <Atoms.Container className="gap-3">
              <Atoms.Typography
                as="h3"
                className="text-2xl leading-[32px] font-semibold whitespace-nowrap text-foreground sm:text-[28px]"
              >
                SMS Verification
              </Atoms.Typography>

              <Atoms.Typography as="p" className="text-5xl leading-none font-semibold text-brand lg:text-6xl">
                Free
              </Atoms.Typography>

              <Atoms.Typography
                as="p"
                className="text-xs font-medium tracking-[0.1em] whitespace-nowrap text-muted-foreground uppercase"
              >
                LESS PRIVATE, BUT EASY
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
              data-testid="human-sms-card-receive-sms-btn"
              variant={Atoms.ButtonVariant.SECONDARY}
              className="h-12 w-auto rounded-full px-5 py-3 text-sm font-semibold text-secondary-foreground shadow-xs-dark"
              onClick={onClick}
              disabled={isGeoblocked}
            >
              <Libs.Smartphone className="mr-2 h-4 w-4" />
              Receive SMS
            </Atoms.Button>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.Card>

      {/* Geoblocking overlay badge */}
      {isGeoblocked && (
        <Atoms.Container
          overrideDefaults
          data-testid="geoblock-alert"
          className="absolute top-1/2 left-1/2 flex h-11 -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-md bg-destructive/60 px-6 py-3 shadow-xl"
        >
          <Atoms.Container overrideDefaults className="pt-0.5">
            <Libs.TriangleAlert className="text-destructive-foreground size-4" />
          </Atoms.Container>
          <Atoms.Typography
            overrideDefaults
            className="text-destructive-foreground text-sm font-semibold whitespace-nowrap"
          >
            Currently not available in your country
          </Atoms.Typography>
        </Atoms.Container>
      )}
    </Atoms.Container>
  );
};
