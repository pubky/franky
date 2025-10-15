'use client';

import { useState, useEffect } from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Core from '@/core';
import * as Organisms from '@/organisms';

/**
 * AlertBackup
 *
 * Self-contained component that manages its own visibility state.
 * Shows an alert when user has a secret key that needs to be backed up.
 * No props needed - manages its own state internally.
 */
export const AlertBackup = () => {
  const { secretKey } = Core.useOnboardingStore();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (secretKey) {
      setShowAlert(true);
    }
  }, [secretKey]);

  const handleDismiss = () => {
    setShowAlert(false);
  };

  // Don't show alert if there's no secretKey or it was dismissed
  if (!secretKey || !showAlert) {
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
      <Organisms.DialogConfirmBackup onConfirm={handleDismiss} />
    </Atoms.Container>
  );
};
