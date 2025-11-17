'use client';

import * as Atoms from '@/atoms';

export function ProfilePageFollowers() {
  return (
    <Atoms.Container overrideDefaults={true} className="mt-6 flex flex-col gap-4 lg:mt-0">
      <Atoms.Heading level={1} size="lg" className="text-foreground">
        Followers
      </Atoms.Heading>
      <Atoms.Typography as="p" className="text-base font-normal text-muted-foreground">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat.
      </Atoms.Typography>
    </Atoms.Container>
  );
}
