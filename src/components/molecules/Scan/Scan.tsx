'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';

export const ScanContent = () => {
  return (
    <>
      <Atoms.Container size="container" className="hidden md:flex">
        <ScanHeader isMobile={false} />
        <Molecules.ContentCard layout="column">
          {/* TODO: change to real qr code url */}
          <Atoms.Container className="items-center justify-center">
            <Image src="/images/pubky-ring-qr-example.png" alt="Pubky Ring" width={220} height={220} />
          </Atoms.Container>
        </Molecules.ContentCard>
      </Atoms.Container>
      <Atoms.Container size="container" className="md:hidden">
        <ScanHeader isMobile={true} />
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

export const ScanFooter = () => {
  return (
    <Atoms.FooterLinks className="py-6">
      Use{' '}
      <Atoms.Link href="https://www.pubkyring.to/" target="_blank">
        Pubky Ring
      </Atoms.Link>{' '}
      or any other{' '}
      <Atoms.Link href="https://pubky.org" target="_blank">
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
