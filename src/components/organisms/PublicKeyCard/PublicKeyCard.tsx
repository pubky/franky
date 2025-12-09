'use client';

import { useEffect, useState } from 'react';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';

export function PublicKeyCard() {
  const { setKeypair, setMnemonic, selectPublicKey } = Core.useOnboardingStore();
  const { copyToClipboard } = Hooks.useCopyToClipboard();
  const [pubky, setPubky] = useState<string>('');
  const canUseWebShare = Libs.isWebShareSupported();

  useEffect(() => {
    try {
      const publicKey = selectPublicKey();
      setPubky(publicKey);
    } catch (error) {
      Libs.Logger.info('Generating new keypair persisted in the global store', { error });
      const { keypair, mnemonic } = Libs.Identity.generateKeypair();
      setKeypair(keypair);
      setMnemonic(mnemonic);
      setPubky(Libs.Identity.pubkyFromKeypair(keypair));
    }
  }, [selectPublicKey, setKeypair, setMnemonic]);

  const handleCopyToClipboard = () => {
    if (pubky) {
      copyToClipboard(pubky);
    }
  };

  const handleShare = async () => {
    if (!pubky) return;

    try {
      await Libs.shareWithFallback(
        {
          title: 'My Pubky',
          text: `Here is my Pubky:\n${pubky}`,
        },
        {
          onFallback: async () => {
            const copied = await copyToClipboard(pubky);

            if (!copied) {
              throw new Error('Unable to copy pubky to clipboard');
            }
          },
          onSuccess: (result) => {
            if (result.method === 'fallback') {
              Molecules.toast({
                title: 'Sharing unavailable',
                description: 'We copied your pubky so you can paste it into your favorite app.',
              });
            }
          },
          onError: () => {
            Molecules.toast({
              title: 'Share failed',
              description: 'Unable to share right now. Please try again.',
            });
          },
        },
      );
    } catch (error) {
      // Error handling is done in the onError callback
      // This catch block is here for any unexpected errors
      Libs.Logger.error('Unexpected share error', { error });
    }
  };

  const actions = [
    {
      id: 'copy-to-clipboard-action-btn',
      label: 'Copy to clipboard',
      icon: <Libs.Copy className="mr-2 h-4 w-4" />,
      onClick: handleCopyToClipboard,
      variant: 'secondary' as const,
      disabled: !pubky,
    },
    ...(canUseWebShare
      ? [
          {
            label: 'Share',
            icon: <Libs.Share className="mr-2 h-4 w-4" />,
            onClick: handleShare,
            variant: 'secondary' as const,
            disabled: !pubky,
            className: 'md:hidden',
          },
        ]
      : []),
  ];

  return (
    <Molecules.ContentCard
      image={{
        src: '/images/key.png',
        alt: 'Key',
        width: 192,
        height: 192,
      }}
    >
      <Atoms.Container className="flex-row items-center gap-1">
        <Atoms.Heading level={3} size="lg">
          Your pubky
        </Atoms.Heading>
        <Molecules.PopoverPublicKey />
      </Atoms.Container>
      <Molecules.ActionSection actions={actions} className="w-full flex-col items-start justify-start gap-3">
        <Molecules.InputField
          value={pubky}
          variant="dashed"
          readOnly
          onClick={handleCopyToClipboard}
          loading={!pubky}
          loadingText="Generating pubky..."
          icon={<Libs.Key className="h-4 w-4 text-brand" />}
          status={pubky ? 'success' : 'default'}
          className="w-full max-w-[576px]"
        />
      </Molecules.ActionSection>
    </Molecules.ContentCard>
  );
}
