'use client';

import { ScanContent } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/onboarding/install');
  };

  return <ScanContent onHandleBackButton={handleBack} />;
}
