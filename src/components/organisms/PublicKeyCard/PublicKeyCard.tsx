'use client';

import { useEffect } from 'react';
import { Copy, Key } from 'lucide-react';

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

  const handleCopyToClipboard = async () => {
    try {
      await Libs.copyToClipboard(publicKey);
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
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard',
        variant: 'error',
      });
    }
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
          icon={<Key className="h-4 w-4 text-brand" />}
          status={publicKey === '' ? 'default' : 'success'}
          className="w-full max-w-[576px]"
        />
      </Molecules.ActionSection>
    </Molecules.ContentCard>
  );
}
