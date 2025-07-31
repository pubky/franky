'use client';

import {
  DialogPrivacy,
  DialogTerms,
  DialogAge,
  PopoverInvite,
  FooterLinks,
  Link,
  Container,
  Typography,
  Heading,
  ActionButtons,
  PageContainer,
  ImageBackground,
} from '@/components/ui';
import { useRouter } from 'next/navigation';

export const BackgroundHomeOrganism = () => {
  return <ImageBackground className="opacity-10 lg:opacity-100" image="/images/bg-home.svg" />;
};

export const TitleHomeOrganism = () => {
  return (
    <Heading level={1} size="2xl">
      <span className="text-brand">Unlock</span>
      <br />
      the web.
    </Heading>
  );
};

export const SubtitleHomeOrganism = () => {
  return (
    <Container className="flex-row items-start gap-2 pt-6">
      <Typography size="lg" className="text-brand font-normal">
        Pubky requires an invite code
      </Typography>
      <PopoverInvite />
    </Container>
  );
};

export const ActionHomeOrganism = () => {
  const router = useRouter();

  const handleCreateAccount = () => {
    router.push('/onboarding/install');
  };

  const handleSignIn = () => {
    console.log('Sign in clicked');
  };

  return <ActionButtons onSignIn={handleSignIn} onCreateAccount={handleCreateAccount} />;
};

export const FooterHomeOrganism = () => {
  return (
    <FooterLinks className="mt-6 max-w-[588px] text-muted-foreground">
      By creating a Pubky account, you agree to the <DialogTerms linkText="Terms of Service" />,{' '}
      <DialogPrivacy linkText="Privacy Policy" />, and confirm you are <DialogAge linkText="over 18 years old." /> Pubky
      is powered by{' '}
      <Link href="https://pubky.org/" target="_blank">
        Pubky Core
      </Link>{' '}
      and was built with love and dedication by Synonym Software Ltd. ©2025.
    </FooterLinks>
  );
};

export const HomeOrganism = ({ children }: { children: React.ReactNode }) => {
  return (
    <PageContainer>
      <Container>{children}</Container>
    </PageContainer>
  );
};
