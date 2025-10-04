'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Core from '@/core';
import * as Organisms from '@/organisms';

interface AlertBackupProps {
  onDismiss?: () => void;
}

export const AlertBackup = ({ onDismiss }: AlertBackupProps) => {
  const { secretKey } = Core.useOnboardingStore();

  // Don't show alert if there's no secretKey (user signed in with their own keys)
  if (!secretKey) {
    return null;
  }

  return (
    <Atoms.Container className="px-6 py-3 bg-brand rounded-lg flex-row items-center gap-3">
      <Atoms.Container className="flex-row flex-1 gap-3 items-center">
        <Libs.TriangleAlert className="h-4 w-4 font-bold text-primary-foreground" />
        <Atoms.Typography size="sm" className="font-bold text-primary-foreground whitespace-nowrap">
          Back up now<span className="hidden md:inline"> to avoid losing your account!</span>
        </Atoms.Typography>
      </Atoms.Container>
      <Organisms.DialogBackup />
      <Organisms.DialogConfirmBackup onConfirm={onDismiss} />
    </Atoms.Container>
  );
};
