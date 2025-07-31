'use client';

import {
  Button,
  PageHeader,
  PageSubtitle,
  PageTitle,
  ContentCard,
  ButtonsNavigation,
  PageContainer,
  ContentContainer,
  FooterLinks,
  ResponsiveSection,
  Link,
  Container,
} from '@/components/ui';
import { Key } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export const ScanHeaderOrganism = ({ isMobile }: { isMobile: boolean }) => {
  return (
    <PageHeader>
      <PageTitle size="medium">
        {isMobile ? (
          <>
            Tap to <span className="text-brand">Authorize.</span>
          </>
        ) : (
          <>
            Scan <span className="text-brand">QR Code.</span>
          </>
        )}
      </PageTitle>
      <PageSubtitle>Open Pubky Ring, create a pubky, and scan the QR.</PageSubtitle>
    </PageHeader>
  );
};

export const MainScanOrganism = () => {
  return (
    <ResponsiveSection
      desktop={
        <>
          <ScanHeaderOrganism isMobile={false} />
          <ContentCard layout="column">
            {/* TODO: change to real qr code url */}
            <Container className="items-center justify-center">
              <Image src="/images/pubky-ring-qr-example.png" alt="Pubky Ring" width={220} height={220} />
            </Container>
          </ContentCard>
        </>
      }
      mobile={
        <>
          <ScanHeaderOrganism isMobile={true} />

          <ContentCard layout="column">
            <Container className="flex-col lg:flex-row gap-12 items-center justify-center">
              <Image src="/images/logo-pubky-ring.svg" alt="Pubky Ring" width={137} height={30} />
              <Button className="w-full h-[60px] rounded-full" size="lg">
                <Key className="mr-2 h-4 w-4" />
                Authorize with Pubky Ring
              </Button>
            </Container>
          </ContentCard>
        </>
      }
    />
  );
};

export const FooterScanOrganism = () => {
  return (
    <FooterLinks>
      Use{' '}
      <Link href="https://www.pubkyring.to/" target="_blank">
        Pubky Ring
      </Link>{' '}
      or any other{' '}
      <Link href="https://pubky.org" target="_blank">
        Pubky Core
      </Link>
      –powered keychain.
    </FooterLinks>
  );
};

export const ScanNavigationOrganism = () => {
  const router = useRouter();

  const onHandleBackButton = () => {
    router.push('/onboarding/pubky');
  };

  return (
    <ButtonsNavigation
      continueButtonDisabled={true}
      hiddenContinueButton={true}
      onHandleBackButton={onHandleBackButton}
    />
  );
};

export const ScanOrganism = ({ children }: { children: React.ReactNode }) => {
  return (
    <PageContainer as="main">
      <ContentContainer maxWidth="lg">{children}</ContentContainer>
    </PageContainer>
  );
};
