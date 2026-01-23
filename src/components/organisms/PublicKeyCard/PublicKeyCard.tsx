'use client';

import { useEffect } from 'react';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';

export function PublicKeyCard() {
  const secretKey = Core.useOnboardingStore((state) => state.secretKey);
  const pubky = Core.useAuthStore((state) => state.currentUserPubky);
  const displayPubky = pubky ? Libs.withPubkyPrefix(pubky) : '';
  const { copyToClipboard } = Hooks.useCopyToClipboard();
  const { toast } = Molecules.useToast();

  useEffect(() => {
    if (!secretKey) {
      Core.ProfileController.generateSecrets();
    }
  }, [secretKey]);

  const handleCopyToClipboard = () => {
    if (displayPubky) {
      copyToClipboard(displayPubky);
    }
  };

  const handleShare = async () => {
    if (!displayPubky) return;

    try {
      await Libs.shareWithFallback(
        {
          title: 'My Pubky',
          text: `Here is my Pubky:\n${displayPubky}`,
        },
        {
          onFallback: async () => {
            const copied = await copyToClipboard(displayPubky);

            if (!copied) {
              throw new Error('Unable to copy pubky to clipboard');
            }
          },
          onSuccess: (result) => {
            if (result.method === 'fallback') {
              toast({
                title: 'Sharing unavailable',
                description: 'We copied your pubky so you can paste it into your favorite app.',
              });
            }
          },
          onError: () => {
            toast({
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
      disabled: !displayPubky,
    },
    // Share button is always rendered on mobile (hidden on md+ screens via CSS).
    // When Web Share API is unavailable, it falls back to clipboard copy.
    // See issue #265: visibility based on screen size, not Web Share API support.
    {
      label: 'Share',
      icon: <Libs.Share className="mr-2 h-4 w-4" />,
      onClick: handleShare,
      variant: 'secondary' as const,
      disabled: !displayPubky,
      className: 'md:hidden',
    },
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
          value={displayPubky}
          variant="dashed"
          readOnly
          onClick={handleCopyToClipboard}
          loading={!displayPubky}
          loadingText="Generating pubky..."
          icon={<Libs.Key className="h-4 w-4 text-brand" />}
          status={displayPubky ? 'success' : 'default'}
          className="w-full max-w-[576px]"
          dataCy="pubky-display"
        />
      </Molecules.ActionSection>
    </Molecules.ContentCard>
  );
}
