'use client';

import { useRouter } from 'next/navigation';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as App from '@/app';

export function HeaderButtonSignIn({ ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  const router = useRouter();

  const handleSignIn = () => {
    router.push(App.AUTH_ROUTES.SIGN_IN);
  };

  return (
    <Atoms.Button id="header-sign-in-btn" variant="secondary" onClick={handleSignIn} {...props}>
      <Libs.LogIn className="mr-2 h-4 w-4" />
      Sign in
    </Atoms.Button>
  );
}
