'use client';

import { useRouter } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as App from '@/app';
import * as Core from '@/core';
import { useState } from 'react';
import { useToast } from '@/molecules';

export const BackupNavigation = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { secretKey, inviteCode } = Core.useOnboardingStore();
  const onHandleContinueButton = async () => {
    setLoading(true);
    try {
      await Core.AuthController.signUp({ secretKey: secretKey!, signupToken: inviteCode });
      router.push(App.ONBOARDING_ROUTES.PROFILE);
    } catch (error) {
      toast({
        title: 'Error - Failed to sign up',
        description: 'Something went wrong. Please try again.',
      });
      console.error('Failed to sign up', error);
    } finally {
      setLoading(false);
    }
  };

  const onHandleBackButton = () => {
    router.push(App.ONBOARDING_ROUTES.PUBKY);
  };

  return (
    <Molecules.ButtonsNavigation
      id="backup-navigation"
      className="py-6"
      onHandleBackButton={onHandleBackButton}
      loadingContinueButton={loading}
      onHandleContinueButton={onHandleContinueButton}
      backText="Back"
      continueText="Continue"
    />
  );
};

export const BackupPageHeader = () => {
  return (
    <Atoms.PageHeader data-testid="backup-page-header">
      <Molecules.PageTitle size="large">
        Back up your <span className="text-brand">pubky.</span>
      </Molecules.PageTitle>
      <Atoms.PageSubtitle>You need a backup to restore access to your account later.</Atoms.PageSubtitle>
    </Atoms.PageHeader>
  );
};
