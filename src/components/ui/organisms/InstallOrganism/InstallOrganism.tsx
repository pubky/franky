'use client';

import {
  FooterLinks,
  Link,
  Container,
  Typography,
  PageHeader,
  PageSubtitle,
  PageTitle,
  ContentCard,
  StoreButtons,
  Button,
  PopoverTradeoffs,
  PageContainer,
} from '@/components/ui';
import { cn } from '@/libs';
import { AppWindow, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export const InstallHeaderOrganism = () => {
  return (
    <PageHeader>
      <PageTitle size="large">
        Install <span className="text-brand">Pubky Ring.</span>
      </PageTitle>
      <PageSubtitle>Pubky Ring is a keychain for your identity keys in the Pubky ecosystem.</PageSubtitle>
    </PageHeader>
  );
};

export const MainInstallOrganism = () => {
  return (
    <ContentCard
      image={{
        src: '/images/keyring.png',
        alt: 'Keyring',
        width: 192,
        height: 192,
        size: 'large',
      }}
    >
      <Container className="">
        <Image src="/images/logo-pubky-ring.svg" alt="Pubky Ring" width={220} height={48} />
        <Typography className="text-secondary-foreground opacity-80 font-normal">
          Download and install the mobile app to start creating your account.
        </Typography>
      </Container>
      <StoreButtons />
    </ContentCard>
  );
};

export const FooterInstallOrganism = () => {
  return (
    <FooterLinks className="mt-6">
      Use{' '}
      <Link href="https://www.pubkyring.to/" target="_blank">
        Pubky Ring
      </Link>{' '}
      or any other{' '}
      <Link href="https://pubky.org" target="_blank">
        Pubky Core
      </Link>
      –powered keychain, or create your keys in the browser (less secure).
    </FooterLinks>
  );
};

export const InstallNavigationOrganism = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();

  const handleCreate = () => {
    router.push('/onboarding/pubky');
  };

  const handleContinue = () => {
    router.push('/onboarding/scan');
  };

  return (
    <Container className={cn('flex-col-reverse lg:flex-row gap-3 lg:gap-6', props.className)}>
      <Container className="items-center gap-1 flex-row">
        <Button variant="outline" className="rounded-full flex-1 md:flex-none" onClick={handleCreate}>
          <AppWindow className="mr-2 h-4 w-4" />
          Create keys in browser
        </Button>
        <PopoverTradeoffs />
      </Container>
      <Button size="lg" className="rounded-full" onClick={handleContinue}>
        <ArrowRight className="mr-2 h-4 w-4" />
        Continue with Pubky Ring
      </Button>
    </Container>
  );
};

export const InstallOrganism = ({ children }: { children: React.ReactNode }) => {
  return <PageContainer>{children}</PageContainer>;
};
