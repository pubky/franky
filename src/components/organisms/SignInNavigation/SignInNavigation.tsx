'use client';

import { useRouter } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as App from '@/app';

export const SignInNavigation = () => {
  const router = useRouter();

  const handleRestore = () => {
    router.push(App.HOME_ROUTES.HOME);
  };

  return (
    <Atoms.Container className="flex-col-reverse md:flex-row gap-3 lg:gap-6 justify-start">
      <Atoms.Container className="flex-col gap-3 sm:flex-row w-auto sm:w-full justify-start items-start mx-0 sm:mx-auto">
        <Organisms.DialogRestoreRecoveryPhrase onRestore={handleRestore} />
        <Organisms.DialogRestoreEncryptedFile onRestore={handleRestore} />
      </Atoms.Container>
    </Atoms.Container>
  );
};
