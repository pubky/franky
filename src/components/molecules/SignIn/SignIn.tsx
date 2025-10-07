'use client';

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import * as Core from '@/core';

export const SignInContent = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);
  const activeRequestRef = useRef<symbol | null>(null);
  const isGeneratingRef = useRef(false);

  const fetchUrl = async (options?: { viaRetry?: boolean }) => {
    const requestId = Symbol('fetchUrl');
    activeRequestRef.current = requestId;
    isGeneratingRef.current = true;
    if (!options?.viaRetry) setIsLoading(true);

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
              title: 'Sign in failed',
              description: 'Unable to complete authorization with Pubky Ring. Please try again.',
            });
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
        });

      // Guard against late responses from previous calls
      if (activeRequestRef.current !== requestId || !isMountedRef.current) return;

      if (generatedUrl) setUrl(generatedUrl);
      retryCountRef.current = 0;
    } catch (error) {
      Libs.Logger.error('Failed to generate auth URL:', error);
      retryCountRef.current += 1;

      if (retryCountRef.current < 3) {
        willRetry = true;
        // bounded backoff: 250ms, 500ms
        const delayMs = Math.min(1000, 250 * retryCountRef.current);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        await fetchUrl({ viaRetry: true });
      }

      if (isMountedRef.current) {
        Molecules.toast({
          title: 'QR code generation failed',
          description: 'Unable to generate sign-in QR code. Please refresh the page.',
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

  const handleAuthorizeClick = () => {
    if (isLoading || isGeneratingRef.current) return;

    if (!url) {
      if (activeRequestRef.current) return;
      fetchUrl();
      return;
    }

    try {
      window.location.href = url;
    } catch (error) {
      Libs.Logger.error('Failed to open Pubky Ring deeplink:', error);
      Molecules.toast({
        title: 'Unable to link to signer application Pubky Ring',
        description: 'Please try again.',
      });
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchUrl();
    return () => {
      isMountedRef.current = false;
      activeRequestRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/** Desktop view */}
      <Atoms.Container size="container" className="hidden md:flex">
        <SignInHeader />
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
        <SignInHeader />
        <Molecules.ContentCard layout="column">
          <Atoms.Container className="flex-col lg:flex-row gap-12 items-center justify-center">
            <Image src="/images/logo-pubky-ring.svg" alt="Pubky Ring" width={137} height={30} />
            <Atoms.Button
              className="w-full h-[60px] rounded-full"
              size="lg"
              onClick={handleAuthorizeClick}
              disabled={isLoading}
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

export const SignInFooter = () => {
  return (
    <Atoms.FooterLinks className="py-6">
      Not able to sign in with{' '}
      <Atoms.Link href="https://pubkyring.app/" target="_blank" rel="noopener noreferrer">
        Pubky Ring
      </Atoms.Link>
      ? Use the recovery phrase or encrypted file to restore your account.
    </Atoms.FooterLinks>
  );
};

export const SignInHeader = () => {
  return (
    <Atoms.PageHeader>
      <Molecules.PageTitle size="large">
        Sign in to <span className="text-brand">Pubky.</span>
      </Molecules.PageTitle>
      <Atoms.PageSubtitle>Authorize with Pubky Ring to sign in.</Atoms.PageSubtitle>
    </Atoms.PageHeader>
  );
};
