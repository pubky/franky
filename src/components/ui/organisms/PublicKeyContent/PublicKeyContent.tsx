'use client';

import {
  Button,
  ButtonsNavigation,
  PopoverPublicKey,
  useToast,
  PageHeader,
  ContentCard,
  ActionSection,
  BrandText,
  PageContainer,
  ContentContainer,
  InputField,
} from '@/components/ui';
import { Copy, Key, Loader2 } from 'lucide-react';

interface PublicKeyContentProps {
  className?: string;
  pubky: string;
  onHandleBackButton?: () => void;
  onHandleContinueButton?: () => void;
}

export function PublicKeyContent({
  className,
  pubky,
  onHandleBackButton,
  onHandleContinueButton,
}: PublicKeyContentProps) {
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(pubky);
    const toastInstance = toast({
      title: 'Pubky copied to clipboard',
      description: pubky,
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
    <PageContainer className={className}>
      <ContentContainer maxWidth="lg">
        <PageHeader
          title={
            <>
              Your unique <BrandText>pubky.</BrandText>
            </>
          }
          subtitle="Share your pubky with your friends so they can follow you."
        />

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
              value={pubky}
              variant="dashed"
              readOnly
              onClick={handleCopyToClipboard}
              loading={pubky === ''}
              loadingText="Generating pubky..."
              loadingIcon={<Loader2 className="h-9 w-9 text-brand animate-spin linear infinite" />}
              icon={<Key className="h-4 w-4 text-brand" />}
            />
          </ActionSection>
        </ContentCard>

        <ButtonsNavigation onHandleBackButton={onHandleBackButton} onHandleContinueButton={onHandleContinueButton} />
      </ContentContainer>
    </PageContainer>
  );
}
