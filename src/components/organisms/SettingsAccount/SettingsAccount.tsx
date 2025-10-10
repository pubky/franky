'use client';

import { useState, useEffect, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import { AUTH_ROUTES } from '@/app';

export interface SettingsAccountProps {
  className?: string;
}

const SettingsSection = ({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonIcon: ButtonIcon,
  buttonId,
  buttonVariant = 'secondary',
  buttonDisabled = false,
  buttonOnClick,
  titleClassName,
  iconClassName,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  buttonText: string;
  buttonIcon: ComponentType<{ size?: number }>;
  buttonId: string;
  buttonVariant?: 'secondary' | 'destructive';
  buttonDisabled?: boolean;
  buttonOnClick: () => void;
  titleClassName?: string;
  iconClassName?: string;
}) => (
  <div className="flex-col justify-start items-start flex">
    <div className="justify-start items-center gap-2 inline-flex pb-6">
      <Icon size={24} className={iconClassName} />
      <Atoms.Heading level={2} size="xl" className={titleClassName}>
        {title}
      </Atoms.Heading>
    </div>
    <Atoms.Typography size="md" className="text-base-secondary-foreground text-base font-medium leading-6  pb-6">
      {description}
    </Atoms.Typography>
    <Atoms.Button
      id={buttonId}
      variant={buttonVariant}
      size="default"
      disabled={buttonDisabled}
      onClick={buttonOnClick}
    >
      <ButtonIcon size={16} />
      {buttonText}
    </Atoms.Button>
  </div>
);

const Divider = () => <div className="w-full h-px bg-white/10 mt-6 mb-12" />;

export function SettingsAccount({ className }: SettingsAccountProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [progressDownload, setProgressDownload] = useState(0);
  const [disposableAccount] = useState(false);

  useEffect(() => {
    // Simulate loading account settings
    const loadSettings = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      // TODO: Load from storage or backend
      setIsLoading(false);
    };
    void loadSettings();
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

  if (isLoading) {
    return <Atoms.SettingsLoader className={className} />;
  }

  return (
    <Molecules.SettingsSectionCard icon={Libs.User} title="Account" description="" className={className}>
      <SettingsSection
        icon={Libs.LogOut}
        title="Sign out from Pubky"
        description="Sign out to protect your account from unauthorized access."
        buttonText="Sign out"
        buttonIcon={Libs.LogOut}
        buttonId="settings-sign-out-btn"
        buttonOnClick={handleSignOut}
      />

      <Divider />

      <SettingsSection
        icon={Libs.Pencil}
        title="Edit your profile"
        description="Update your bio or user picture, so friends can find you easier."
        buttonText="Edit profile"
        buttonIcon={Libs.Pencil}
        buttonId="edit-profile-btn"
        buttonOnClick={() => {}}
      />

      <Divider />

      <SettingsSection
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

      <Divider />

      <SettingsSection
        icon={Libs.Download}
        title="Download your data"
        description="Your data on Pubky is yours. Export your account data to use it elsewhere. Note this is not a full pubky homeserver export, this function will export data related to pubky.app."
        buttonText={loadingDownload ? `Downloading... ${progressDownload}%` : 'Download data'}
        buttonIcon={Libs.Download}
        buttonId="download-data-btn"
        buttonDisabled={loadingDownload}
        buttonOnClick={handleDownloadData}
      />

      <Divider />

      <SettingsSection
        icon={Libs.Trash2}
        title="Delete your account"
        description="Deleting your account will remove all of your posts, tags, profile information, contacts, custom streams, and settings or preferences."
        buttonText="Delete Account"
        buttonIcon={Libs.Trash2}
        buttonId="delete-account-btn"
        buttonVariant="destructive"
        titleClassName="text-destructive"
        iconClassName="text-destructive"
        buttonOnClick={() => {}}
      />
    </Molecules.SettingsSectionCard>
  );
}
