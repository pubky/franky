'use client';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Libs from '@/libs';

export const CreateProfileHeader = () => {
  const { publicKey } = Core.useOnboardingStore();

  const displayPublicKey = Libs.formatPublicKey(publicKey, 10);

  const handleCopyToClipboard = async () => {
    try {
      await Libs.copyToClipboard(publicKey);
      const toastInstance = Molecules.toast({
        title: 'Pubky copied to clipboard',
        description: publicKey,
        action: (
          <Atoms.Button
            variant="outline"
            className="rounded-full h-10 px-4 bg-transparent border-brand text-white hover:bg-brand/20"
            onClick={() => toastInstance.dismiss()}
          >
            OK
          </Atoms.Button>
        ),
      });
    } catch {
      Molecules.toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard',
      });
    }
  };

  return (
    <Atoms.PageHeader>
      <Molecules.PageTitle size="large">
        Create your <span className="text-brand">profile.</span>
      </Molecules.PageTitle>
      <Atoms.Container className="flex-col md:flex-row md:items-center gap-4 w-auto m-0">
        <Atoms.PageSubtitle>Add your name, bio, links, and avatar.</Atoms.PageSubtitle>
        <Atoms.Container className="flex-row items-center gap-2 w-auto mx-0">
          <Atoms.Button variant="secondary" className="rounded-full gap-2 w-fit h-8" onClick={handleCopyToClipboard}>
            <Libs.Key className="w-4 h-4" />
            {displayPublicKey || '...'}
          </Atoms.Button>
          <Molecules.PopoverPublicKey className="-ml-1" />
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.PageHeader>
  );
};
