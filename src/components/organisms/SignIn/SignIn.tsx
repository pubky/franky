'use client';

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import * as Core from '@/core';
import * as Config from '@/config';
import * as Hooks from '@/hooks';

export const SignInContent = () => {
  const { url, isLoading, fetchUrl } = Hooks.useAuthUrl();

  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const fallbackUrl = isIOS ? Config.APP_STORE_URL : Config.PLAY_STORE_URL;

  useEffect(() => {
    // Clear onboarding storage when sign-in flow begins to prevent backup reminders from showing for existing users
    Core.useOnboardingStore.getState().reset();
  }, []);

  const copyAuthUrlToClipboard = async () => {
    if (!url) return;

    try {
      await Libs.copyToClipboard({ text: url });
    } catch (error) {
      Libs.Logger.error('Failed to copy auth URL to clipboard:', error);
    }
  };

  const handleAuthorizeClick = async () => {
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
        <SignInHeader />
        <Molecules.ContentCard layout="column">
          <Atoms.Container className="items-center justify-center">
            <div className="flex h-[220px] w-[220px] items-center justify-center rounded-lg bg-foreground p-4">
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
          <Atoms.Container className="flex-col items-center justify-center gap-12 lg:flex-row">
            <Image src="/images/logo-pubky-ring.svg" alt="Pubky Ring" width={137} height={30} />
            <Atoms.Button
              className="h-[60px] w-full rounded-full"
              size="lg"
              onClick={handleAuthorizeClick}
              disabled={isLoading || !url}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Libs.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span aria-live="polite">Generating...</span>
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
