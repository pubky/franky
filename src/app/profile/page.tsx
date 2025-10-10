'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/app';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(APP_ROUTES.PROFILE_POSTS);
  }, [router]);

  return null;
}
