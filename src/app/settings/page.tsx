'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SETTINGS_ROUTES } from '@/app';
import * as Atoms from '@/atoms';

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push(SETTINGS_ROUTES.ACCOUNT);
  }, [router]);

  return <Atoms.SettingsLoader />;
}
