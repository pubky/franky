'use client';

import {
  ButtonsNavigation,
  PopoverPublicKey,
  PageHeader,
  ContentCard,
  BrandText,
  PageContainer,
  ContentContainer,
} from '@/components/ui';

interface BackupContentProps {
  className?: string;
  onHandleBackButton?: () => void;
  onHandleContinueButton?: () => void;
}

export function BackupContent({ className, onHandleBackButton, onHandleContinueButton }: BackupContentProps) {
  return (
    <PageContainer as="main" className={className}>
      <ContentContainer maxWidth="lg">
        <PageHeader
          title={
            <>
              Back up your <BrandText>pubky.</BrandText>
            </>
          }
          subtitle="You need a backup to restore access to your account later."
        />

        <ContentCard
          image={{
            src: '/images/shield.png',
            alt: 'Shield',
            width: 192,
            height: 192,
            size: 'medium',
          }}
        >
          <div className="flex items-center gap-1">
            <h3 className="text-2xl font-bold">Choose backup method</h3>
            <PopoverPublicKey />
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-secondary-foreground opacity-80">
              Safely back up and store the secret seed for your pubky. Which backup method do you prefer? You can also
              choose to do this later.
            </p>
          </div>
        </ContentCard>

        <ButtonsNavigation
          onHandleBackButton={onHandleBackButton}
          onHandleContinueButton={onHandleContinueButton}
          backText="Back"
          continueText="Continue"
        />
      </ContentContainer>
    </PageContainer>
  );
}
