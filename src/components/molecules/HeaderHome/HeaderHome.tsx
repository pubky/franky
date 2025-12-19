'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export const HeaderHome = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <Atoms.Container className="flex-1 flex-row items-center justify-end" {...props}>
      <Molecules.HeaderSocialLinks />
      <Molecules.HeaderButtonSignIn />
    </Atoms.Container>
  );
};
