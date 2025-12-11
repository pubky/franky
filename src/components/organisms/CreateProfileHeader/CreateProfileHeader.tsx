'use client';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';

export const CreateProfileHeader = (): React.ReactElement => {
  const { pubky } = Core.useOnboardingStore();
  const { copyToClipboard } = Hooks.useCopyToClipboard();

  const displayPublicKey = Libs.formatPublicKey({ key: pubky, length: 10 });

  const handleCopyToClipboard = (): void => {
    copyToClipboard(pubky);
  };

  return (
    <Atoms.PageHeader>
      <Molecules.PageTitle size="large">
        Create your <span className="text-brand">profile.</span>
      </Molecules.PageTitle>
      <Atoms.Container className="m-0 w-auto flex-col gap-4 md:flex-row md:items-center">
        <Atoms.PageSubtitle>Add your name, bio, links, and avatar.</Atoms.PageSubtitle>
        <Atoms.Container className="mx-0 w-auto flex-row items-center gap-2">
          <Atoms.Button variant="secondary" className="h-8 w-fit gap-2 rounded-full" onClick={handleCopyToClipboard}>
            <Libs.Key className="h-4 w-4" />
            {displayPublicKey || '...'}
          </Atoms.Button>
          <Molecules.PopoverPublicKey className="-ml-1" />
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.PageHeader>
  );
};
