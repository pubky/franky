'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Config from '@/config';
import * as App from '@/app';
import * as Core from '@/core';

export const InstallCard = () => {
  return (
    <Molecules.ContentCard
      image={{
        src: '/images/keyring.png',
        alt: 'Keyring',
        width: 192,
        height: 192,
      }}
    >
      <Atoms.Container className="gap-3">
        <Atoms.Container className="flex-col items-center sm:items-start">
          <Image
            src="/images/logo-pubky-ring.svg"
            alt="Pubky Ring"
            className="w-[137px] sm:w-auto"
            width={220}
            height={48}
          />
        </Atoms.Container>
        <Atoms.Typography className="text-secondary-foreground opacity-80 font-medium text-base">
          Download and install the mobile app to start creating your account.
        </Atoms.Typography>
      </Atoms.Container>
      <StoreButtons />
    </Molecules.ContentCard>
  );
};

export const InstallFooter = () => {
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
      –powered keychain, or create your keys in the browser (less secure).
    </Atoms.FooterLinks>
  );
};

export const InstallHeader = () => {
  return (
    <Atoms.PageHeader>
      <Molecules.PageTitle size="large">
        Install <br className="block sm:hidden" /> <span className="text-brand">Pubky Ring.</span>
      </Molecules.PageTitle>
      <Atoms.PageSubtitle>Pubky Ring is a keychain for your identity keys in the Pubky ecosystem.</Atoms.PageSubtitle>
    </Atoms.PageHeader>
  );
};

export const InstallNavigation = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();
  const { reset } = Core.useOnboardingStore();

  const handleCreate = () => {
    // Reset any existing keypair to ensure a fresh one is generated
    reset();
    router.push(App.ONBOARDING_ROUTES.PUBKY);
  };

  const handleContinue = () => {
    router.push(App.ONBOARDING_ROUTES.SCAN);
  };

  return (
    <Atoms.Container className={Libs.cn('flex-col-reverse md:flex-row gap-3 lg:gap-6', props.className)}>
      <Atoms.Container className="items-center gap-1 flex-row">
        <Atoms.Button
          id="create-keys-in-browser-btn"
          variant="outline"
          className="rounded-full flex-1 md:flex-none"
          onClick={handleCreate}
        >
          <Libs.AppWindow className="mr-2 h-4 w-4" />
          Create keys in browser
        </Atoms.Button>
        <Molecules.PopoverTradeoffs />
      </Atoms.Container>
      <Atoms.Button id="continue-with-pubky-ring-btn" size="lg" className="rounded-full" onClick={handleContinue}>
        <Libs.ArrowRight className="mr-2 h-4 w-4" />
        Continue with Pubky Ring
      </Atoms.Button>
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
