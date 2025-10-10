'use client';

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import * as Config from '@/config';
import * as Core from '@/core';
import * as App from '@/app';

export const ScanContent = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [, setErrorCount] = useState(0);

  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const fallbackUrl = isIOS ? Config.APP_STORE_URL : Config.PLAY_STORE_URL;

  const fetchUrl = async () => {
    setIsLoading(true);
    setUrl('');
    try {
      const data = await Core.AuthController.getAuthUrl();
      if (!data) return;

      const { url, promise } = data;

      if (url) setUrl(url);

      promise?.then(async (publicKey) => {
        await Core.AuthController.loginWithAuthUrl({ publicKey });
      });
    } catch (error) {
      console.error('Failed to generate auth URL:', error);
      setErrorCount((prev) => {
        const next = prev + 1;
        if (next < 3) {
          void fetchUrl();
        }
        return next;
      });
      Molecules.toast({
        title: 'Error generating auth URL',
        description: 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      await fetchUrl();
      return;
    }

    await copyAuthUrlToClipboard();

    const deeplink = `pubkyring://${url}`;

    try {
      const openedWindow = window.open(deeplink, '_blank');

      if (!openedWindow) {
        window.location.href = deeplink;
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
      Molecules.toast({
        title: 'Unable to link to signer application Pubky Ring',
        description: 'Please try again.',
      });
      window.location.href = fallbackUrl;
    }
  };

  useEffect(() => {
    fetchUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/** Desktop view */}
      <Atoms.Container size="container" className="hidden md:flex">
        <ScanHeader isMobile={false} />
        <Molecules.ContentCard layout="column">
          <Atoms.Container className="items-center justify-center">
            <div className="bg-foreground rounded-lg p-4 w-[220px] h-[220px] flex items-center justify-center">
              {isLoading || !url ? (
                <Atoms.Container className="items-center gap-2">
                  <Libs.Loader2 className="h-8 w-8 animate-spin text-background" />
                  <Atoms.Typography as="small" size="sm" className="text-background">
                    Generating QR Code...
                  </Atoms.Typography>
                </Atoms.Container>
              ) : (
                <QRCodeSVG value={url} size={220} />
              )}
            </div>
          </Atoms.Container>
        </Molecules.ContentCard>
      </Atoms.Container>

      {/** Mobile view */}
      <Atoms.Container size="container" className="md:hidden">
        <ScanHeader isMobile={true} />
        <Molecules.ContentCard layout="column">
          <Atoms.Container className="flex-col lg:flex-row gap-12 items-center justify-center">
            <Image src="/images/logo-pubky-ring.svg" alt="Pubky Ring" width={137} height={30} />
            <Atoms.Button
              className="w-full h-[60px] rounded-full"
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
