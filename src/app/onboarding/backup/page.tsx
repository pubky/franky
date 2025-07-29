'use client';

import { BackupContent } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function BackupPage() {
  const router = useRouter();

  const onHandleContinueButton = () => {
    console.log('handleContinue');
  };

  const onHandleBackButton = () => {
    router.push('/onboarding/pubky');
  };

  return <BackupContent onHandleBackButton={onHandleBackButton} onHandleContinueButton={onHandleContinueButton} />;
}
