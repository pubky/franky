'use client';

import { useRouter } from 'next/navigation';
import { PublicKeyContent } from '@/components/ui';
import { Identity } from '@/libs';
import { useOnboardingStore } from '@/core';
import { useEffect } from 'react';

export default function PubkyPage() {
  const router = useRouter();
  const { setKeypair, publicKey } = useOnboardingStore();

  const handleBack = () => {
    router.push('/onboarding/install');
  };

  const handleNext = () => {
    router.push('/onboarding/backup');
  };

  useEffect(() => {
    if (publicKey === '') {
      const generatePubky = () => {
        const keypair = Identity.generateKeypair();
        setKeypair(keypair.publicKey, keypair.secretKey);
      };

      generatePubky();
    }
  }, [publicKey, setKeypair]);

  return <PublicKeyContent pubky={publicKey} onHandleBackButton={handleBack} onHandleContinueButton={handleNext} />;
}
