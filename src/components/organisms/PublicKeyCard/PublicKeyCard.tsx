'use client';

import { useEffect } from 'react';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Libs from '@/libs';

export function PublicKeyCard() {
  const { copyToClipboard } = Libs.useCopyToClipboard();
  const { setKeypair, publicKey } = Core.useOnboardingStore();

  useEffect(() => {
    if (publicKey === '') {
      const generatePubky = () => {
        const keypair = Libs.Identity.generateKeypair();
        setKeypair(keypair.publicKey, keypair.secretKey);
      };

      generatePubky();
    }
  }, [publicKey, setKeypair]);

  const handleCopyToClipboard = () => {
    copyToClipboard(publicKey);
  };

  return (
    <Molecules.ContentCard
      image={{
        src: '/images/key.png',
        alt: 'Key',
        width: 192,
        height: 192,
      }}
    >
      <Atoms.Container className="items-center gap-1 flex-row">
        <Atoms.Heading level={3} size="lg">
          Your pubky
        </Atoms.Heading>
        <Molecules.PopoverPublicKey />
      </Atoms.Container>
      <Molecules.ActionSection
        actions={[
          {
            label: 'Copy to clipboard',
            icon: <Libs.Copy className="mr-2 h-4 w-4" />,
            onClick: handleCopyToClipboard,
            variant: 'secondary',
          },
        ]}
        className="flex-col items-start gap-3 justify-start w-full"
      >
        <Molecules.InputField
          value={publicKey}
          variant="dashed"
          readOnly
          onClick={handleCopyToClipboard}
          loading={publicKey === ''}
          loadingText="Generating pubky..."
          icon={<Libs.Key className="h-4 w-4 text-brand" />}
          status={publicKey === '' ? 'default' : 'success'}
          className="w-full max-w-[576px]"
        />
      </Molecules.ActionSection>
    </Molecules.ContentCard>
  );
}
