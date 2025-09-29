'use client';

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import * as Core from '@/core';

export const SignInContent = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorCount, setErrorCount] = useState(0);

  const fetchUrl = async () => {
    try {
      const data = await Core.AuthController.getAuthUrl();
      if (!data) return;

      const { url, promise } = data;

      if (url) setUrl(url);

      promise?.then(async (publicKey) => {
        try {
          await Core.AuthController.loginWithAuthUrl({ publicKey });
        } catch (error) {
          Libs.Logger.error('Failed to login with auth URL:', error);
          Molecules.toast({
            title: 'Sign in failed',
            description: 'Unable to complete authorization with Pubky Ring. Please try again.',
          });
        }
      });
    } catch (error) {
      Libs.Logger.error('Failed to generate auth URL:', error);
      setErrorCount(errorCount + 1);
      if (errorCount < 3) fetchUrl();
      Molecules.toast({
        title: 'QR code generation failed',
        description: 'Unable to generate sign-in QR code. Please refresh the page.',
      });
    } finally {
      setIsLoading(false);
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
            <Atoms.Button className="w-full h-[60px] rounded-full" size="lg">
              <Libs.Key className="mr-2 h-4 w-4" />
              Authorize with Pubky Ring
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
      <Atoms.Link href="https://pubkyring.app/" target="_blank">
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
