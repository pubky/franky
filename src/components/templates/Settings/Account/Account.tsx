'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';
import * as Core from '@/core';
import * as App from '@/app';

export function Account() {
  const router = useRouter();
  const { toast } = Molecules.useToast();
  const t = useTranslations('settings.account');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const [loadingSignOut, setLoadingSignOut] = useState(false);
  const [disposableAccount] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const showErrorToast = useCallback(
    (description: string) => {
      toast({
        title: tCommon('error'),
        description,
        className: 'destructive border-destructive bg-destructive text-destructive-foreground',
      });
    },
    [toast, tCommon],
  );

  const handleSignOut = async () => {
    setLoadingSignOut(true);
    try {
      await Core.AuthController.logout();
      router.push(App.AUTH_ROUTES.LOGOUT);
    } catch (error) {
      Libs.Logger.error('Failed to sign out:', { error });
      showErrorToast(tErrors('signOutFailed'));
      setLoadingSignOut(false);
    }
  };

  const handleOpenDeleteDialog = () => {
    setShowDeleteDialog(true);
  };

  const handleEditProfile = () => {
    router.push(App.SETTINGS_ROUTES.EDIT);
  };

  return (
    <>
      <Molecules.SettingsSectionCard icon={Libs.UserRound} title={t('title')}>
        <Molecules.SettingsSection
          title={t('signOut.title')}
          description={t('signOut.description')}
          buttonText={loadingSignOut ? t('signOut.buttonLoading') : t('signOut.button')}
          buttonIcon={Libs.LogOut}
          buttonId="sign-out-btn"
          buttonDisabled={loadingSignOut}
          buttonOnClick={handleSignOut}
        />

        <Molecules.SettingsDivider />

        <Molecules.SettingsSection
          title={t('editProfile.title')}
          description={t('editProfile.description')}
          buttonText={t('editProfile.button')}
          buttonIcon={Libs.Pencil}
          buttonId="edit-profile-btn"
          buttonOnClick={handleEditProfile}
        />

        <Molecules.SettingsDivider />

        <Molecules.SettingsSection
          title={t('backup.title')}
          description={disposableAccount ? t('backup.descriptionNeeded') : t('backup.descriptionDone')}
          buttonText={t('backup.button')}
          buttonIcon={Libs.LockKeyhole}
          buttonId="backup-account-btn"
          buttonDisabled={!disposableAccount}
          buttonOnClick={() => {}}
        />

        <Molecules.SettingsDivider />

        <Molecules.SettingsSection
          title={t('deleteAccount.title')}
          description={t('deleteAccount.description')}
          buttonText={t('deleteAccount.button')}
          buttonIcon={Libs.Trash2}
          buttonId="delete-account-btn"
          buttonVariant="destructive"
          buttonOnClick={handleOpenDeleteDialog}
        />
      </Molecules.SettingsSectionCard>

      <Organisms.DialogDeleteAccount isOpen={showDeleteDialog} onOpenChangeAction={setShowDeleteDialog} />
    </>
  );
}
