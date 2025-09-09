'use client';

import Image from 'next/image';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';

export const SignInContent = () => {
  return (
    <>
      <Atoms.Container size="container" className="hidden md:flex">
        <SignInHeader />
        <Molecules.ContentCard layout="column">
          {/* TODO: change to real qr code url */}
          <Atoms.Container className="items-center justify-center">
            <Image src="/images/pubky-ring-qr-example.png" alt="Pubky Ring" width={220} height={220} />
          </Atoms.Container>
        </Molecules.ContentCard>
      </Atoms.Container>
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
