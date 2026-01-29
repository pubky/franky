'use client';

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import * as Config from '@/config';
import * as App from '@/app';
import * as Hooks from '@/hooks';
import * as Core from '@/core';

export const ScanContent = () => {
  const inviteCode = Core.useOnboardingStore((state) => state.inviteCode);
  const { url, isLoading, fetchUrl } = Hooks.useAuthUrl({ type: 'signup', inviteCode });

  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const fallbackUrl = isIOS ? Config.APP_STORE_URL : Config.PLAY_STORE_URL;

  const copyAuthUrlToClipboard = async () => {
    if (!url) return;

    try {
      await Libs.copyToClipboard({ text: url });
    } catch (error) {
      Libs.Logger.error('Failed to copy auth URL to clipboard:', error);
    }
  };

  const handleMobileAuth = async () => {
    if (isLoading) return;

    if (!url) {
      void fetchUrl();
      return;
    }

    await copyAuthUrlToClipboard();

    try {
      const openedWindow = window.open(url, '_blank');

      if (!openedWindow) {
        window.location.href = url;
        return;
      }

      setTimeout(() => {
        try {
          openedWindow.location.href = fallbackUrl;
        } catch (error) {
          Libs.Logger.error('Failed to redirect to store after deeplink attempt:', error);
          window.location.href = fallbackUrl;
        }
      }, 2000);
    } catch (error) {
      Libs.Logger.error('Failed to open Pubky Ring deeplink:', error);
      Molecules.toast.error('Unable to link to signer application Pubky Ring', {
        description: 'Please try again.',
      });
      window.location.href = fallbackUrl;
    }
  };

  return (
    <>
      {/** Desktop view */}
      <Atoms.Container size="container" className="hidden md:flex">
        <ScanHeader isMobile={false} />
        <Molecules.ContentCard layout="column">
          <Atoms.Container className="items-center justify-center gap-4">
            <div className="relative flex h-[220px] w-[220px] items-center justify-center rounded-lg bg-foreground p-4">
              {isLoading || !url ? (
                <Atoms.Container className="items-center gap-2">
                  <Libs.Loader2 className="h-8 w-8 animate-spin text-background" />
                  <Atoms.Typography as="small" size="sm" className="text-background">
                    Generating QR Code...
                  </Atoms.Typography>
                </Atoms.Container>
              ) : (
                <>
                  <QRCodeSVG value={url} size={220} />
                  <Image
                    src="/images/ring-logo.svg"
                    alt="Pubky Ring"
                    width={48}
                    height={48}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  />
                </>
              )}
            </div>
            {inviteCode && (
              <Atoms.Typography as="p" className="text-lg font-semibold tracking-widest text-brand">
                {inviteCode}
              </Atoms.Typography>
            )}
          </Atoms.Container>
        </Molecules.ContentCard>
      </Atoms.Container>

      {/** Mobile view */}
      <Atoms.Container size="container" className="md:hidden">
        <ScanHeader isMobile={true} />
        <Molecules.ContentCard layout="column">
          <Atoms.Container className="flex-col items-center justify-center gap-12 lg:flex-row">
            <Image src="/images/logo-pubky-ring.svg" alt="Pubky Ring" width={137} height={30} />
            <Atoms.Button
              className="h-[60px] w-full rounded-full"
              size="lg"
              onClick={handleMobileAuth}
              disabled={isLoading || !url}
            >
              {isLoading ? (
                <>
                  <Libs.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Libs.Key className="mr-2 h-4 w-4" />
                  Authorize with Pubky Ring
                </>
              )}
            </Atoms.Button>
          </Atoms.Container>
        </Molecules.ContentCard>
      </Atoms.Container>
    </>
  );
};

export const ScanFooter = () => {
  return (
    <Atoms.FooterLinks className="py-6">
      Use{' '}
      <Atoms.Link href={Config.PUBKY_RING_URL} target="_blank">
        Pubky Ring
      </Atoms.Link>{' '}
      or any other{' '}
      <Atoms.Link href={Config.PUBKY_CORE_URL} target="_blank">
        Pubky Core
      </Atoms.Link>
      –powered keychain.
    </Atoms.FooterLinks>
  );
};

export const ScanHeader = ({ isMobile }: { isMobile: boolean }) => {
  return (
    <Atoms.PageHeader>
      <Molecules.PageTitle size="large">
        {isMobile ? (
          <>
            Tap to <span className="text-brand">Authorize.</span>
          </>
        ) : (
          <>
            Scan <span className="text-brand">QR Code.</span>
          </>
        )}
      </Molecules.PageTitle>
      <Atoms.PageSubtitle>Open Pubky Ring, create a pubky, and scan the QR.</Atoms.PageSubtitle>
    </Atoms.PageHeader>
  );
};

export const ScanNavigation = () => {
  const router = useRouter();

  const onHandleBackButton = () => {
    router.push(App.ONBOARDING_ROUTES.INSTALL);
  };

  return (
    <Molecules.ButtonsNavigation
      continueButtonDisabled={true}
      hiddenContinueButton={true}
      onHandleBackButton={onHandleBackButton}
    />
  );
};
