'use client';

import { useRouter } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export function Feed() {
  const router = useRouter();

  const handleLogout = () => {
    // Just navigate to logout page - logout logic will happen there
    router.push('/logout');
  };

  return (
    <Atoms.Container size="container" className="px-6">
      <Atoms.Container size="default" className="items-start mx-0 flex flex-col gap-6">
        <Atoms.Container className="flex items-center justify-between w-full">
          <Atoms.Heading level={1} size="xl" className="text-2xl">
            Feed
          </Atoms.Heading>

          {/* Logout button */}
          <Atoms.Button variant="secondary" size="sm" onClick={handleLogout}>
            Logout
          </Atoms.Button>
        </Atoms.Container>

        {/* Posts */}
        <Molecules.Posts />
      </Atoms.Container>
    </Atoms.Container>
  );
}
