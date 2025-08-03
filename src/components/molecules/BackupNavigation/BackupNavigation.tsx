'use client';

import { useRouter } from 'next/navigation';
import * as Molecules from '@/molecules';

export const BackupNavigation = () => {
  const router = useRouter();

  const onHandleContinueButton = () => {
    console.log('handleContinue');
  };

  const onHandleBackButton = () => {
    router.push('/onboarding/pubky');
  };

  return (
    <Molecules.ButtonsNavigation
      onHandleBackButton={onHandleBackButton}
      onHandleContinueButton={onHandleContinueButton}
      backText="Back"
      continueText="Continue"
    />
  );
};
