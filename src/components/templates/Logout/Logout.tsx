'use client';

import { useEffect } from 'react';

import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Molecules from '@/molecules';

export function Logout() {
  const performLogout = async () => {
    await Core.AuthController.logout();
  };

  useEffect(() => {
    performLogout();
  }, []);

  return (
    <Atoms.Container size="container" className="px-6">
      <Molecules.LogoutContent />
      <Molecules.LogoutNavigation />
    </Atoms.Container>
  );
}
