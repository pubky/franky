'use client';

import { useState } from 'react';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';

export interface AccountProps {
  className?: string;
}

export function Account({ className }: AccountProps) {
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [progressDownload, setProgressDownload] = useState(0);
  const [disposableAccount] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  return (
    <>
      <Molecules.SettingsSectionCard className={className}>
        <Molecules.SettingsSection
          icon={Libs.Pencil}
          title="Edit your profile"
          description="Update your bio or user picture, so friends can find you easier."
          buttonText="Edit profile"
          buttonIcon={Libs.Pencil}
          buttonId="edit-profile-btn"
          buttonOnClick={() => {}}
        />

        <Molecules.SettingsDivider />

        <Molecules.SettingsSection
          icon={Libs.Lock}
          title="Back up your account"
          description={
            disposableAccount
              ? 'Without a backup you lose your account if you close your browser!'
              : 'You have already completed the backup, or closed your browser before doing so. Your recovery file and seed phrase have been deleted.'
          }
          buttonText="Back up account"
          buttonIcon={Libs.Lock}
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
          buttonVariant="destructive"
          titleClassName="text-destructive"
          iconClassName="text-destructive"
          buttonOnClick={handleOpenDeleteDialog}
        />
      </Molecules.SettingsSectionCard>

      <Organisms.DialogDeleteAccount isOpen={showDeleteDialog} onOpenChangeAction={setShowDeleteDialog} />
    </>
  );
}
