'use client';

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
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
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);
  const activeRequestRef = useRef<symbol | null>(null);
  const isGeneratingRef = useRef(false);
  const MAX_RETRY_ATTEMPTS = 3;

  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const fallbackUrl = isIOS ? Config.APP_STORE_URL : Config.PLAY_STORE_URL;

  const fetchUrl = async (options?: { viaRetry?: boolean }) => {
    const requestId = Symbol('fetchUrl');
    activeRequestRef.current = requestId;
    isGeneratingRef.current = true;
    if (!options?.viaRetry) {
      setIsLoading(true);
      setUrl('');
    }

    let willRetry = false;

    try {
      const data = await Core.AuthController.getAuthUrl();
      if (!data) return;

      const { url: generatedUrl, promise } = data;

      // Always attach handlers to avoid unhandled rejections even if unmounted
      promise
        ?.then(async (publicKey) => {
          // Ignore if unmounted or superseded
          if (activeRequestRef.current !== requestId || !isMountedRef.current) return;
          try {
            await Core.AuthController.loginWithAuthUrl({ publicKey });
          } catch (error) {
            Libs.Logger.error('Failed to login with auth URL:', error);
            if (!isMountedRef.current) return;
            Molecules.toast({
              title: 'Authorization failed',
              description: 'Unable to complete authorization with Pubky Ring. Please try again.',
            });
            if (activeRequestRef.current === requestId) {
              void fetchUrl();
            }
          }
        })
        .catch((error: unknown) => {
          // Rejected authorization or transport failure
          Libs.Logger.error('Authorization promise rejected:', error);
          if (!isMountedRef.current) return;
          Molecules.toast({
            title: 'Authorization was not completed',
            description: 'The signer did not complete authorization. Please try again.',
          });
          if (activeRequestRef.current === requestId) {
            void fetchUrl();
          }
        });

      // Guard against late responses from previous calls
      if (activeRequestRef.current !== requestId || !isMountedRef.current) return;

      if (generatedUrl) setUrl(generatedUrl);
      retryCountRef.current = 0;
    } catch (error) {
      retryCountRef.current += 1;
      const attempts = retryCountRef.current;
      Libs.Logger.error(`Failed to generate auth URL (attempt ${attempts} of ${MAX_RETRY_ATTEMPTS}):`, error);

      if (attempts < MAX_RETRY_ATTEMPTS) {
        willRetry = true;
        // bounded backoff: 250ms, 500ms
        const delayMs = Math.min(1000, 250 * attempts);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        await fetchUrl({ viaRetry: true });
      } else if (isMountedRef.current) {
        Molecules.toast({
          title: 'QR code generation failed',
          description: 'Unable to generate auth QR code. Please refresh and try again.',
        });
      }
    } finally {
      // Only clear loading if we are not immediately retrying and this is the latest request
      if (!willRetry && activeRequestRef.current === requestId) {
        isGeneratingRef.current = false;
        if (isMountedRef.current) setIsLoading(false);
      }
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
    if (isLoading || isGeneratingRef.current) return;

    if (!url) {
      if (activeRequestRef.current) return;
      void fetchUrl();
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
    isMountedRef.current = true;
    fetchUrl();
    return () => {
      isMountedRef.current = false;
      activeRequestRef.current = null;
      isGeneratingRef.current = false;
    };
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
