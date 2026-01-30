'use client';

import { useEffect } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Core from '@/core';

export function Logout() {
  // Reset the isLoggingOut flag when arriving at the logout page
  // This ensures the flag is cleared after successful navigation
  useEffect(() => {
    Core.useAuthStore.getState().setIsLoggingOut(false);
  }, []);

  return (
    <Atoms.Container size="container" className="px-6">
      <Molecules.LogoutContent />
      <Molecules.LogoutNavigation />
    </Atoms.Container>
  );
}
