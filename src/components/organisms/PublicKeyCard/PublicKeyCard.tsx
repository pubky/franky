'use client';

import { useEffect } from 'react';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';

export function PublicKeyCard() {
  const { setKeypair, setMnemonic, pubky } = Core.useOnboardingStore();
  const { copyToClipboard } = Hooks.useCopyToClipboard();

  useEffect(() => {
    if (pubky === '') {
      const generatePubky = () => {
        const keypair = Libs.Identity.generateKeypair();
        setKeypair(keypair.pubky, keypair.secretKey);
        setMnemonic(keypair.mnemonic);
      };

      generatePubky();
    }
  }, [pubky, setKeypair, setMnemonic]);

  const handleCopyToClipboard = () => {
    copyToClipboard(pubky);
  };

  const handleShare = async () => {
    try {
      const text = `Here is my Pubky:\n${pubky}`;
      if (navigator.share) {
        await navigator.share({
          title: 'My Pubky',
          text,
        });
        return;
      }

      // Fallback: copy to clipboard and notify
      await copyToClipboard(pubky);
      Molecules.toast({
        title: 'Pubky copied',
        description: 'Paste it into your favorite app to share it.',
      });
    } catch (err) {
      const error = err as { name?: string } | undefined;
      // Ignore user-cancelled shares
      if (error?.name === 'AbortError') return;
      Molecules.toast({
        title: 'Share failed',
        description: 'Unable to share right now. Please try again.',
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
            icon: <Libs.Copy className="mr-2 h-4 w-4" />,
            onClick: handleCopyToClipboard,
            variant: 'secondary',
          },
          {
            label: 'Share',
            icon: <Libs.Share className="mr-2 h-4 w-4" />,
            onClick: handleShare,
            variant: 'secondary',
          },
        ]}
        className="flex-col items-start gap-3 justify-start w-full"
      >
        <Molecules.InputField
          value={pubky}
          variant="dashed"
          readOnly
          onClick={handleCopyToClipboard}
          loading={pubky === ''}
          loadingText="Generating pubky..."
          icon={<Libs.Key className="h-4 w-4 text-brand" />}
          status={pubky === '' ? 'default' : 'success'}
          className="w-full max-w-[576px]"
        />
      </Molecules.ActionSection>
    </Molecules.ContentCard>
  );
}
