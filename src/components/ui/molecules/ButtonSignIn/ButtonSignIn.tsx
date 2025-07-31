'use client';

import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';

export function ButtonSignIn() {
  const router = useRouter();
  const handleSignIn = () => {
    router.push('/onboarding/signin');
  };

  return (
    <Button variant="secondary" onClick={handleSignIn}>
      <LogIn className="mr-2 h-4 w-4" />
      Sign in
    </Button>
  );
}
