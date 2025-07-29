'use client';

import Image from 'next/image';
import {
  StoreButtons,
  InstallNavigation,
  PageHeader,
  ContentCard,
  FooterLinks,
  BrandText,
  PageContainer,
  ContentContainer,
  BrandLink,
} from '@/components/ui';

interface InstallContentProps {
  className?: string;
  onCreateKeysInBrowser?: () => void;
  onContinueWithPubkyRing?: () => void;
}

export function InstallContent({ className, onCreateKeysInBrowser, onContinueWithPubkyRing }: InstallContentProps) {
  return (
    <PageContainer as="main" className={className}>
      <ContentContainer maxWidth="lg">
        <PageHeader
          title={
            <>
              Install <BrandText>Pubky Ring.</BrandText>
            </>
          }
          subtitle="Pubky Ring is a keychain for your identity keys in the Pubky ecosystem."
        />

        <ContentCard
          image={{
            src: '/images/keyring.png',
            alt: 'Keyring',
            width: 192,
            height: 192,
            size: 'medium',
          }}
        >
          <div className="flex flex-col gap-3">
            <Image src="/images/logo-pubky-ring.svg" alt="Pubky Ring" width={220} height={48} />
            <p className="text-secondary-foreground opacity-80">
              Download and install the mobile app to start creating your account.
            </p>
          </div>
          <StoreButtons />
        </ContentCard>

        <FooterLinks>
          Use{' '}
          <BrandLink href="https://www.pubkyring.to/" external>
            Pubky Ring
          </BrandLink>{' '}
          or any other{' '}
          <BrandLink href="https://pubky.org" external>
            Pubky Core
          </BrandLink>
          –powered keychain, or create your keys in the browser (less secure).
        </FooterLinks>

        <InstallNavigation
          onCreateKeysInBrowser={onCreateKeysInBrowser}
          onContinueWithPubkyRing={onContinueWithPubkyRing}
        />
      </ContentContainer>
    </PageContainer>
  );
}
