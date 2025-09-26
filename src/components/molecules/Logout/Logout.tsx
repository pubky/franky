'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as App from '@/app';

export const LogoutContent = () => {
  return (
    <Atoms.Container size="container" className="mb-6">
      <LogoutHeader />
      <Molecules.ContentCard layout="column">
        <Atoms.Container className="items-center justify-center">
          <Image src="/images/tag.png" alt="Pubky Ring" width={192} height={192} />
        </Atoms.Container>
      </Molecules.ContentCard>
    </Atoms.Container>
  );
};

export const LogoutHeader = () => {
  return (
    <Atoms.PageHeader>
      <Molecules.PageTitle size="large">
        See you <span className="text-brand">soon!</span>
      </Molecules.PageTitle>
      <Atoms.PageSubtitle>You have securely signed out.</Atoms.PageSubtitle>
    </Atoms.PageHeader>
  );
};

export const LogoutNavigation = () => {
  const router = useRouter();

  const onHandleBackButton = () => {
    router.push(App.ROOT_ROUTES);
  };

  const onHandleContinueButton = () => {
    router.push(App.AUTH_ROUTES.SIGN_IN);
  };

  return (
    <Molecules.ButtonsNavigation
      backText="Homepage"
      continueText="Sign back in"
      onHandleContinueButton={onHandleContinueButton}
      onHandleBackButton={onHandleBackButton}
    />
  );
};
