'use client';

import { useRouter } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as App from '@/app';

export const BackupNavigation = (): React.ReactElement => {
  const router = useRouter();

  const onHandleContinueButton = (): void => {
    router.push(App.ONBOARDING_ROUTES.HOMESERVER);
  };

  const onHandleBackButton = (): void => {
    router.push(App.ONBOARDING_ROUTES.PUBKY);
  };

  return (
    <Molecules.ButtonsNavigation
      id="backup-navigation"
      className="py-6"
      onHandleBackButton={onHandleBackButton}
      onHandleContinueButton={onHandleContinueButton}
      backText="Back"
      continueText="Continue"
    />
  );
};

export const BackupPageHeader = (): React.ReactElement => {
  return (
    <Atoms.PageHeader data-testid="backup-page-header">
      <Molecules.PageTitle size="large">
        Back up your <span className="text-brand">pubky.</span>
      </Molecules.PageTitle>
      <Atoms.PageSubtitle>You need a backup to restore access to your account later.</Atoms.PageSubtitle>
    </Atoms.PageHeader>
  );
};
