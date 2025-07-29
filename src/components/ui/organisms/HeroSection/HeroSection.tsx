'use client';

import {
  Heading,
  ActionButtons,
  DialogPrivacy,
  DialogTerms,
  DialogAge,
  PopoverInvite,
  PageContainer,
  ContentContainer,
  BrandLink,
  FooterLinks,
} from '@/components/ui';

interface HeroSectionProps {
  className?: string;
  title?: React.ReactNode;
  subtitle?: string;
  onSignIn?: () => void;
  onCreateAccount?: () => void;
  showInvitePopover?: boolean;
}

export function HeroSection({
  className,
  title,
  subtitle = 'Pubky requires an invite code',
  onSignIn,
  onCreateAccount,
  showInvitePopover = true,
}: HeroSectionProps) {
  return (
    <PageContainer className={className}>
      <ContentContainer maxWidth="xl">
        <Heading level={1} size="hero">
          {title}
        </Heading>

        <div className="flex items-center gap-2">
          <p className="text-xl lg:text-2xl font-light text-brand">{subtitle}</p>
          {showInvitePopover && <PopoverInvite />}
        </div>

        <ActionButtons onSignIn={onSignIn} onCreateAccount={onCreateAccount} />

        <FooterLinks className="mt-6 max-w-[588px]">
          By creating a Pubky account, you agree to the <DialogTerms linkText="Terms of Service" />,{' '}
          <DialogPrivacy linkText="Privacy Policy" />, and confirm you are <DialogAge linkText="over 18 years old." />{' '}
          Pubky is powered by{' '}
          <BrandLink href="https://pubky.org/" external>
            Pubky Core
          </BrandLink>{' '}
          and was built with love and dedication by Synonym Software Ltd. ©2025.
        </FooterLinks>
      </ContentContainer>
    </PageContainer>
  );
}
