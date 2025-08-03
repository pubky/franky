'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AppWindow, ArrowRight } from 'lucide-react';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import { Button } from '@/atoms';

export const InstallCard = () => {
  return (
    <Molecules.ContentCard
      image={{
        src: '/images/keyring.png',
        alt: 'Keyring',
        width: 192,
        height: 192,
        size: 'large',
      }}
    >
      <Atoms.Container>
        <Image src="/images/logo-pubky-ring.svg" alt="Pubky Ring" width={220} height={48} />
        <Atoms.Typography className="text-secondary-foreground opacity-80 font-normal">
          Download and install the mobile app to start creating your account.
        </Atoms.Typography>
      </Atoms.Container>
      <StoreButtons />
    </Molecules.ContentCard>
  );
};

export const InstallFooter = () => {
  return (
    <Atoms.FooterLinks className="mt-6">
      Use{' '}
      <Atoms.Link href="https://www.pubkyring.to/" target="_blank">
        Pubky Ring
      </Atoms.Link>{' '}
      or any other{' '}
      <Atoms.Link href="https://pubky.org" target="_blank">
        Pubky Core
      </Atoms.Link>
      –powered keychain, or create your keys in the browser (less secure).
    </Atoms.FooterLinks>
  );
};

export const InstallHeader = () => {
  return (
    <Atoms.PageHeader>
      <Molecules.PageTitle size="large">
        Install <span className="text-brand">Pubky Ring.</span>
      </Molecules.PageTitle>
      <Atoms.PageSubtitle>Pubky Ring is a keychain for your identity keys in the Pubky ecosystem.</Atoms.PageSubtitle>
    </Atoms.PageHeader>
  );
};

export const InstallNavigation = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();

  const handleCreate = () => {
    router.push('/onboarding/pubky');
  };

  const handleContinue = () => {
    router.push('/onboarding/scan');
  };

  return (
    <Atoms.Container className={Libs.cn('flex-col-reverse lg:flex-row gap-3 lg:gap-6', props.className)}>
      <Atoms.Container className="items-center gap-1 flex-row">
        <Atoms.Button variant="outline" className="rounded-full flex-1 md:flex-none" onClick={handleCreate}>
          <AppWindow className="mr-2 h-4 w-4" />
          Create keys in browser
        </Atoms.Button>
        <Molecules.PopoverTradeoffs />
      </Atoms.Container>
      <Button size="lg" className="rounded-full" onClick={handleContinue}>
        <ArrowRight className="mr-2 h-4 w-4" />
        Continue with Pubky Ring
      </Button>
    </Atoms.Container>
  );
};

export function StoreButtons({ className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Atoms.Container className={Libs.cn('flex-row gap-4 justify-around sm:justify-start', className)}>
      <Molecules.DialogDownloadPubkyRing store="apple" />
      <Molecules.DialogDownloadPubkyRing store="android" />
    </Atoms.Container>
  );
}
