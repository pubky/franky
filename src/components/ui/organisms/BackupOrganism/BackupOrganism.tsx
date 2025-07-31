'use client';

import {
  Container,
  Typography,
  PageHeader,
  PageSubtitle,
  PageTitle,
  ContentCard,
  ButtonsNavigation,
  PopoverPublicKey,
  Heading,
  PageContainer,
  ContentContainer,
} from '@/components/ui';
import { useRouter } from 'next/navigation';

export const BackupHeaderOrganism = () => {
  return (
    <PageHeader>
      <PageTitle size="medium">
        Back up your <span className="text-brand">pubky.</span>
      </PageTitle>
      <PageSubtitle>You need a backup to restore access to your account later.</PageSubtitle>
    </PageHeader>
  );
};

export const MainBackupOrganism = () => {
  return (
    <ContentCard
      image={{
        src: '/images/shield.png',
        alt: 'Shield',
        width: 192,
        height: 192,
        size: 'medium',
      }}
    >
      <Container className="items-center gap-1 flex-row">
        <Heading level={3} size="md">
          Choose backup method
        </Heading>
        <PopoverPublicKey />
      </Container>
      <Container className="flex-col gap-3">
        <Typography className="text-secondary-foreground opacity-80 font-normal">
          Safely back up and store the secret seed for your pubky. Which backup method do you prefer? You can also
          choose to do this later.
        </Typography>
      </Container>
    </ContentCard>
  );
};

export const BackupNavigationOrganism = () => {
  const router = useRouter();

  const onHandleContinueButton = () => {
    console.log('handleContinue');
  };

  const onHandleBackButton = () => {
    router.push('/onboarding/pubky');
  };

  return (
    <ButtonsNavigation
      onHandleBackButton={onHandleBackButton}
      onHandleContinueButton={onHandleContinueButton}
      backText="Back"
      continueText="Continue"
    />
  );
};

export const BackupOrganism = ({ children }: { children: React.ReactNode }) => {
  return (
    <PageContainer as="main">
      <ContentContainer maxWidth="lg">{children}</ContentContainer>
    </PageContainer>
  );
};
