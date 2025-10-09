'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import { AUTH_ROUTES } from '@/app';

export interface SettingsAccountProps {
  className?: string;
}

export function SettingsAccount({ className }: SettingsAccountProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadingDownload, setLoadingDownload] = React.useState(false);
  const [progressDownload, setProgressDownload] = React.useState(0);
  const [importProgress, setImportProgress] = React.useState(0);
  const [importingData, setImportingData] = React.useState(false);
  const [disposableAccount] = React.useState(false);

  React.useEffect(() => {
    // Simulate loading account settings
    const loadSettings = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      // TODO: Load from storage or backend
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  const handleSignOut = () => {
    router.push(AUTH_ROUTES.LOGOUT);
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

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setImportingData(true);
    setImportProgress(0);
    // TODO: Implement import data logic
    setTimeout(() => {
      setImportingData(false);
      setImportProgress(100);
    }, 2000);
  };

  if (isLoading) {
    return <Atoms.SettingsLoader className={className} />;
  }

  return (
    <Molecules.SettingsSectionCard icon={Libs.User} title="Account" description="" className={className}>
      {/* Sign out section */}
      <div className="flex-col justify-start items-start gap-6 flex">
        <div className="justify-start items-center gap-2 inline-flex">
          <Libs.LogOut size={24} />
          <Atoms.Heading level={2} size="xl">
            Sign out from Pubky
          </Atoms.Heading>
        </div>
        <Atoms.Typography size="md" className="text-muted-foreground">
          Sign out to protect your account from unauthorized access.
        </Atoms.Typography>
        <Atoms.Button id="settings-sign-out-btn" variant="secondary" size="default" onClick={handleSignOut}>
          <Libs.LogOut size={18} />
          Sign out
        </Atoms.Button>
      </div>

      <div className="w-full h-px bg-white/10 my-12" />

      {/* Edit profile section */}
      <div className="flex-col justify-start items-start gap-6 flex">
        <div className="justify-start items-center gap-2 inline-flex">
          <Libs.Pencil size={24} />
          <Atoms.Heading level={2} size="xl">
            Edit your profile
          </Atoms.Heading>
        </div>
        <Atoms.Typography size="md" className="text-muted-foreground">
          Update your bio or user picture, so friends can find you easier.
        </Atoms.Typography>
        <Atoms.Button id="edit-profile-btn" variant="secondary" size="default" onClick={() => {}}>
          <Libs.Pencil size={16} />
          Edit profile
        </Atoms.Button>
      </div>

      <div className="w-full h-px bg-white/10 my-12" />

      {/* Backup account section */}
      <div className="flex-col justify-start items-start gap-6 flex">
        <div className="justify-start items-center gap-2 inline-flex">
          <Libs.Lock size={24} />
          <Atoms.Heading level={2} size="xl">
            Back up your account
          </Atoms.Heading>
        </div>
        <Atoms.Typography size="md" className="text-muted-foreground">
          {disposableAccount
            ? 'Without a backup you lose your account if you close your browser!'
            : 'You have already completed the backup, or closed your browser before doing so. Your recovery file and seed phrase have been deleted.'}
        </Atoms.Typography>
        <Atoms.Button
          id="backup-account-btn"
          variant="secondary"
          size="default"
          disabled={!disposableAccount}
          onClick={() => {}}
        >
          <Libs.Lock size={16} />
          Back up account
        </Atoms.Button>
      </div>

      <div className="w-full h-px bg-white/10 my-12" />

      {/* Download data section */}
      <div className="flex-col justify-start items-start gap-6 flex">
        <div className="justify-start items-center gap-2 inline-flex">
          <Libs.Download size={24} />
          <Atoms.Heading level={2} size="xl">
            Download your data
          </Atoms.Heading>
        </div>
        <Atoms.Typography size="md" className="text-muted-foreground">
          Your data on Pubky is yours. Export your account data to use it elsewhere. Note this is not a full pubky
          homeserver export, this function will export data related to pubky.app.
        </Atoms.Typography>
        <Atoms.Button
          id="download-data-btn"
          variant="secondary"
          size="default"
          disabled={loadingDownload}
          onClick={handleDownloadData}
        >
          <Libs.Download size={16} />
          {loadingDownload ? `Downloading... ${progressDownload}%` : 'Download data'}
        </Atoms.Button>
      </div>

      <div className="w-full h-px bg-white/10 my-12" />

      {/* Import data section */}
      <div className="flex-col justify-start items-start gap-6 flex">
        <div className="justify-start items-center gap-2 inline-flex">
          <Libs.Upload size={24} />
          <Atoms.Heading level={2} size="xl">
            Import your data
          </Atoms.Heading>
        </div>
        <Atoms.Typography size="md" className="text-muted-foreground">
          Import your account data from a backup ZIP file. Note this is not a full pubky homeserver import, this
          function will import pubky.app data.
        </Atoms.Typography>
        <div className="w-full md:w-[350px]">
          <Atoms.Input
            id="file_input"
            type="file"
            accept=".zip"
            onChange={handleImportData}
            disabled={importingData}
            className="w-full"
          />
          {importingData && (
            <Atoms.Typography size="sm" className="text-muted-foreground mt-2">
              Importing... {importProgress}%
            </Atoms.Typography>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-white/10 my-12" />

      {/* Delete account section */}
      <div className="flex-col justify-start items-start gap-6 flex">
        <div className="justify-start items-center gap-2 inline-flex">
          <Libs.Trash2 size={24} />
          <Atoms.Heading level={2} size="xl">
            Delete your account
          </Atoms.Heading>
        </div>
        <Atoms.Typography size="md" className="text-muted-foreground">
          Deleting your account will remove all of your posts, tags, profile information, contacts, custom streams, and
          settings or preferences.
        </Atoms.Typography>
        <Atoms.Button id="delete-account-btn" variant="destructive" size="default" onClick={() => {}}>
          <Libs.Trash2 size={16} />
          Delete Account
        </Atoms.Button>
      </div>
    </Molecules.SettingsSectionCard>
  );
}
