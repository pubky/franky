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

export const ScanContent = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const router = useRouter();

  const fetchUrl = async () => {
    try {
      const data = await Core.AuthController.getAuthUrl();
      if (!data) return;

      const { url, promise } = data;

      if (url) setUrl(url);

      promise?.then(async (response) => {
        await Core.AuthController.loginWithAuthUrl({ keypair: response });
        router.push('/feed');
      });
    } catch (error) {
      console.error('Failed to generate auth URL:', error);
      setErrorCount(errorCount + 1);
      if (errorCount < 3) fetchUrl();
      Molecules.toast({
        title: 'Error generating auth URL',
        description: 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMobileAuth = () => {
    fetchUrl();
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
    router.push('/onboarding/install');
  };

  return (
    <Molecules.ButtonsNavigation
      continueButtonDisabled={true}
      hiddenContinueButton={true}
      onHandleBackButton={onHandleBackButton}
    />
  );
};
