'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as App from '@/app';
import * as Core from '@/core';
import { useState } from 'react';
import { useToast } from '@/molecules';

export const BackupNavigation = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('onboarding.backup');
  const { secretKey, inviteCode } = Core.useOnboardingStore();
  const onHandleContinueButton = async () => {
    setLoading(true);
    try {
      await Core.AuthController.signUp({ secretKey: secretKey!, signupToken: inviteCode });
      router.push(App.ONBOARDING_ROUTES.PROFILE);
    } catch (error) {
      let description = t('signUpError');

      if (Libs.isAppError(error)) {
        // Auth errors during signup typically mean invalid/expired invite code
        if (Libs.isAuthError(error)) {
          description = t('invalidInvite');
        } else if (error.message) {
          description = error.message;
        }
      }

      toast({
        title: t('signUpFailed'),
        description,
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
    />
  );
};

export const BackupPageHeader = () => {
  const t = useTranslations('onboarding.backup');
  return (
    <Atoms.PageHeader data-testid="backup-page-header">
      <Molecules.PageTitle size="large">
        {t.rich('title', {
          highlight: (chunks) => <span className="text-brand">{chunks}</span>,
        })}
      </Molecules.PageTitle>
      <Atoms.PageSubtitle>{t('subtitle')}</Atoms.PageSubtitle>
    </Atoms.PageHeader>
  );
};
