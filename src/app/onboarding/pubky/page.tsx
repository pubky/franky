'use client';

import { useRouter } from 'next/navigation';
import { PublicKeyContent } from '@/components/ui';

export default function ScanPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/onboarding/install');
  };

  const handleNext = () => {
    console.log('handleNext');
  };

  return (
    <PublicKeyContent
      pubky="kls37f5pimru3n3iqo9aunodfrrjs7jujuzpdoumf95ttekxri8o"
      onHandleBackButton={handleBack}
      onHandleContinueButton={handleNext}
    />
  );
}
