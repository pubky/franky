'use client';

import Image from 'next/image';
import {
  Button,
  ButtonsNavigation,
  PageHeader,
  ContentCard,
  FooterLinks,
  BrandText,
  PageContainer,
  ContentContainer,
  ResponsiveSection,
  BrandLink,
} from '@/components/ui';
import { Key } from 'lucide-react';

interface ScanContentProps {
  className?: string;
  onHandleBackButton?: () => void;
}

export function ScanContent({ className, onHandleBackButton }: ScanContentProps) {
  return (
    <PageContainer as="main" className={className}>
      <ContentContainer maxWidth="lg">
        <ResponsiveSection
          desktop={
            <>
              <PageHeader
                title={
                  <>
                    Scan <BrandText inline>QR Code.</BrandText>
                  </>
                }
                subtitle="Open Pubky Ring, create a pubky, and scan the QR."
              />

              <ContentCard layout="column">
                <div className="flex items-center justify-center">
                  <Image src="/images/pubky-ring-qr-example.png" alt="Pubky Ring" width={220} height={220} />
                </div>
              </ContentCard>
            </>
          }
          mobile={
            <>
              <PageHeader
                title={
                  <>
                    Tap to <BrandText inline>Authorize.</BrandText>
                  </>
                }
                subtitle="Open Pubky Ring, create a pubky, and scan the QR."
                titleSize="medium"
              />

              <ContentCard layout="column">
                <div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
                  <Image src="/images/logo-pubky-ring.svg" alt="Pubky Ring" width={137} height={30} />
                  <Button className="w-full h-[60px] rounded-full" size="lg">
                    <Key className="mr-2 h-4 w-4" />
                    Authorize with Pubky Ring
                  </Button>
                </div>
              </ContentCard>
            </>
          }
        />

        <FooterLinks>
          Use{' '}
          <BrandLink href="https://www.pubkyring.to/" external>
            Pubky Ring
          </BrandLink>{' '}
          or any other{' '}
          <BrandLink href="https://pubky.org" external>
            Pubky Core
          </BrandLink>
          –powered keychain.
        </FooterLinks>

        <ButtonsNavigation
          onHandleBackButton={onHandleBackButton}
          backText="Back"
          continueText="Continue"
          backButtonDisabled={false}
          continueButtonDisabled={true}
          hiddenContinueButton={true}
        />
      </ContentContainer>
    </PageContainer>
  );
}
