'use client';

import { useEffect } from 'react';
import { Copy, Loader2, Key } from 'lucide-react';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Libs from '@/libs';

export function PublicKeyCard() {
  const { toast } = Molecules.useToast();
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
    navigator.clipboard.writeText(publicKey);
    const toastInstance = toast({
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
  };

  return (
    <Molecules.ContentCard
      image={{
        src: '/images/key.png',
        alt: 'Key',
        width: 265,
        height: 265,
        size: 'large',
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
            icon: <Copy className="mr-2 h-4 w-4" />,
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
          loadingIcon={<Loader2 className="h-4 w-4 text-brand animate-spin linear infinite" />}
          icon={<Key className="h-4 w-4 text-brand" />}
        />
      </Molecules.ActionSection>
    </Molecules.ContentCard>
  );
}
