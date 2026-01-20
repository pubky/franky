'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';
import * as Core from '@/core';
import * as App from '@/app';

export function Account() {
  const router = useRouter();
  const { toast } = Molecules.useToast();
  const [loadingSignOut, setLoadingSignOut] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [progressDownload, setProgressDownload] = useState(0);
  const [disposableAccount] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const showErrorToast = useCallback(
    (description: string) => {
      toast({
        title: 'Error',
        description,
        className: 'destructive border-destructive bg-destructive text-destructive-foreground',
      });
    },
    [toast],
  );

  const handleSignOut = async () => {
    setLoadingSignOut(true);
    try {
      await Core.AuthController.logout();
      router.push(App.AUTH_ROUTES.LOGOUT);
    } catch (error) {
      Libs.Logger.error('Failed to sign out:', { error });
      showErrorToast('Failed to sign out. Please try again.');
      setLoadingSignOut(false);
    }
  };

  const handleDownloadData = async () => {
    setLoadingDownload(true);
    setProgressDownload(0);
    // TODO: Implement download data logic
    setTimeout(() => {
      setLoadingDownload(false);
      setProgressDownload(100);
    }, 2000);
  };

  const handleOpenDeleteDialog = () => {
    setShowDeleteDialog(true);
  };

  const handleEditProfile = () => {
    router.push(App.SETTINGS_ROUTES.EDIT);
  };

  return (
    <>
      <Molecules.SettingsSectionCard icon={Libs.UserRound} title="Account">
        <Molecules.SettingsSection
          icon={Libs.LogOut}
          title="Sign out from Pubky"
          description="Sign out to protect your account from unauthorized access."
          buttonText={loadingSignOut ? 'Signing out...' : 'Sign out'}
          buttonIcon={Libs.LogOut}
          buttonId="sign-out-btn"
          buttonDisabled={loadingSignOut}
          buttonOnClick={handleSignOut}
        />

        <Molecules.SettingsDivider />

        <Molecules.SettingsSection
          icon={Libs.Pencil}
          title="Edit your profile"
          description="Update your bio or user picture, so friends can find you easier."
          buttonText="Edit profile"
          buttonIcon={Libs.Pencil}
          buttonId="edit-profile-btn"
          buttonOnClick={handleEditProfile}
        />

        <Molecules.SettingsDivider />

        <Molecules.SettingsSection
          icon={Libs.LockKeyhole}
          title="Backup your account"
          description={
            disposableAccount
              ? 'Without a backup you lose your account if you close your browser!'
              : 'You have already completed the backup, or closed your browser before doing so. Your recovery file and seed phrase have been deleted.'
          }
          buttonText="Back up"
          buttonIcon={Libs.LockKeyhole}
          buttonId="backup-account-btn"
          buttonDisabled={!disposableAccount}
          buttonOnClick={() => {}}
        />

        <Molecules.SettingsDivider />

        <Molecules.SettingsSection
          icon={Libs.Download}
          title="Download your data"
          description="Your data on Pubky is yours. Export your account data to use it elsewhere."
          buttonText={loadingDownload ? `Downloading... ${progressDownload}%` : 'Download data'}
          buttonIcon={Libs.Download}
          buttonId="download-data-btn"
          buttonDisabled={loadingDownload}
          buttonOnClick={handleDownloadData}
        />

        <Molecules.SettingsDivider />

        <Molecules.SettingsSection
          icon={Libs.Trash2}
          title="Delete your account"
          description="Deleting your account will remove all of your posts, tags, profile information, contacts, custom streams, and settings or preferences."
          buttonText="Delete Account"
          buttonIcon={Libs.Trash2}
          buttonId="delete-account-btn"
          titleClassName="text-destructive"
          iconClassName="text-destructive"
          buttonOnClick={handleOpenDeleteDialog}
        />
      </Molecules.SettingsSectionCard>

      <Organisms.DialogDeleteAccount isOpen={showDeleteDialog} onOpenChangeAction={setShowDeleteDialog} />
    </>
  );
}
