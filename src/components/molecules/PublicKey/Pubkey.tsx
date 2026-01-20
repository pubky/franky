'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as App from '@/app';

export const PublicKeyHeader = () => {
  return (
    <Atoms.PageHeader>
      <Molecules.PageTitle size="large">
        Your unique <span className="text-brand">pubky.</span>
      </Molecules.PageTitle>
      <Atoms.PageSubtitle>Share your pubky with your friends so they can follow you.</Atoms.PageSubtitle>
    </Atoms.PageHeader>
  );
};

export const PublicKeyNavigation = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onHandleBackButton = () => {
    router.push(App.ONBOARDING_ROUTES.INSTALL);
  };

  const onHandleContinueButton = () => {
    setLoading(true);
    router.push(App.ONBOARDING_ROUTES.BACKUP);
  };

  return (
    <Molecules.ButtonsNavigation
      id="public-key-navigation"
      className="py-4 pt-6"
      onHandleBackButton={onHandleBackButton}
      onHandleContinueButton={onHandleContinueButton}
      loadingContinueButton={loading}
    />
  );
};
