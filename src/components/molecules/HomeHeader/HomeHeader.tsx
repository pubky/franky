'use client';

import { useRouter } from 'next/navigation';
import { AUTH_ROUTES } from '@/app';
import * as Atoms from '@/atoms';

/**
 * HomeHeader
 *
 * Self-contained header component for the Home page.
 * Displays the page title and logout button.
 * No props needed - manages its own navigation.
 */
export function HomeHeader() {
  const router = useRouter();

  const handleLogout = () => {
    router.push(AUTH_ROUTES.LOGOUT);
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <Atoms.Heading level={1} size="xl" className="text-2xl">
        Home
      </Atoms.Heading>
      <Atoms.Button id="home-logout-btn" variant="secondary" size="default" onClick={handleLogout}>
        Logout
      </Atoms.Button>
    </div>
  );
}
