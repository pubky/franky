'use client';

import * as Atoms from '@/atoms';
import * as Core from '@/core';

export function Feed() {
  const handleLogout = () => {
    Core.AuthController.logout();
  };

  return (
    <Atoms.Container size="container" className="px-6">
      <Atoms.Container size="default" className="items-start mx-0 flex flex-col gap-6">
        <Atoms.Heading level={1} size="xl" className="text-2xl">
          Feed
        </Atoms.Heading>

        {/* Logout button */}
        <Atoms.Button variant="secondary" size="lg" onClick={handleLogout}>
          Logout
        </Atoms.Button>
      </Atoms.Container>
    </Atoms.Container>
  );
}
