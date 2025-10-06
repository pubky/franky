'use client';

import { useEffect, useMemo } from 'react';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';

export function PublicKeyCard() {
  const { setKeypair, setMnemonic, pubky } = Core.useOnboardingStore();
  const { copyToClipboard } = Hooks.useCopyToClipboard();
  const isTouchDevice = Hooks.useIsTouchDevice();

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
          onFallback: () => copyToClipboard(pubky),
          onSuccess: (result) => {
            if (result.method === 'fallback') {
              Molecules.toast({
                title: 'Pubky copied',
                description: 'Paste it into your favorite app to share it.',
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

  const actions = useMemo(
    () => [
      {
        id: 'copy-to-clipboard-action-btn',
        label: 'Copy to clipboard',
        icon: <Libs.Copy className="mr-2 h-4 w-4" />,
        onClick: handleCopyToClipboard,
        variant: 'secondary' as const,
        disabled: !pubky,
      },
      ...(isTouchDevice
        ? [
            {
              label: 'Share',
              icon: <Libs.Share className="mr-2 h-4 w-4" />,
              onClick: handleShare,
              variant: 'secondary' as const,
              disabled: !pubky,
            },
          ]
        : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isTouchDevice, pubky],
  );

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
      <Molecules.ActionSection actions={actions} className="flex-col items-start gap-3 justify-start w-full">
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
