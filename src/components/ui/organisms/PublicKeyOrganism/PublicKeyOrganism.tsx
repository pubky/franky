'use client';

import {
  Button,
  PageHeader,
  PageSubtitle,
  PageTitle,
  ContentCard,
  ButtonsNavigation,
  PopoverPublicKey,
  ActionSection,
  InputField,
  useToast,
  PageContainer,
  ContentContainer,
} from '@/components/ui';
import { useOnboardingStore } from '@/core';
import { Identity } from '@/libs';
import { Copy, Key, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const PublicKeyHeaderOrganism = () => {
  return (
    <PageHeader>
      <PageTitle size="medium">
        Your unique <span className="text-brand">pubky.</span>
      </PageTitle>
      <PageSubtitle>Share your pubky with your friends so they can follow you.</PageSubtitle>
    </PageHeader>
  );
};

export const MainPublicKeyOrganism = () => {
  const { toast } = useToast();
  const { setKeypair, publicKey } = useOnboardingStore();

  useEffect(() => {
    if (publicKey === '') {
      const generatePubky = () => {
        const keypair = Identity.generateKeypair();
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
        <Button
          variant="outline"
          className="rounded-full h-10 px-4 bg-transparent border-brand text-white hover:bg-brand/20"
          onClick={() => toastInstance.dismiss()}
        >
          OK
        </Button>
      ),
    });
  };
  return (
    <ContentCard
      image={{
        src: '/images/key.png',
        alt: 'Key',
        width: 265,
        height: 265,
        size: 'large',
      }}
    >
      <div className="flex items-center gap-1">
        <h3 className="text-2xl font-bold">Your pubky</h3>
        <PopoverPublicKey />
      </div>

      <ActionSection
        actions={[
          {
            label: 'Copy to clipboard',
            icon: <Copy className="mr-2 h-4 w-4" />,
            onClick: handleCopyToClipboard,
            variant: 'secondary',
          },
        ]}
      >
        <InputField
          value={publicKey}
          variant="dashed"
          readOnly
          onClick={handleCopyToClipboard}
          loading={publicKey === ''}
          loadingText="Generating pubky..."
          loadingIcon={<Loader2 className="h-9 w-9 text-brand animate-spin linear infinite" />}
          icon={<Key className="h-4 w-4 text-brand" />}
        />
      </ActionSection>
    </ContentCard>
  );
};

export const PublicKeyNavigationOrganism = () => {
  const router = useRouter();

  const onHandleBackButton = () => {
    router.push('/onboarding/install');
  };

  const onHandleContinueButton = () => {
    router.push('/onboarding/backup');
  };

  return <ButtonsNavigation onHandleBackButton={onHandleBackButton} onHandleContinueButton={onHandleContinueButton} />;
};

export const PublicKeyOrganism = ({ children }: { children: React.ReactNode }) => {
  return (
    <PageContainer as="main">
      <ContentContainer maxWidth="lg">{children}</ContentContainer>
    </PageContainer>
  );
};
