'use client';

import { Heading, InvitePopover, ActionButtons, DialogPrivacy, DialogTerms, DialogAge } from '@/components/ui';

interface HeroSectionProps {
  className?: string;
  title?: string;
  subtitle?: string;
  onSignIn?: () => void;
  onCreateAccount?: () => void;
  showInvitePopover?: boolean;
}

export function HeroSection({
  className = 'container mx-auto px-6 lg:px-10 pt-24 lg:pt-36',
  title = 'Unlock\nthe web.',
  subtitle = 'Pubky requires an invite code',
  onSignIn,
  onCreateAccount,
  showInvitePopover = true,
}: HeroSectionProps) {
  const titleParts = title.split('\n');

  return (
    <div className={className}>
      <div className="flex flex-col gap-6 max-w-[588px]">
        <Heading level={1} size="hero">
          {titleParts.map((part, index) => (
            <span key={index}>
              {part}
              {index < titleParts.length - 1 && <br />}
            </span>
          ))}
        </Heading>

        <div className="flex items-center gap-2">
          <p className="text-xl lg:text-2xl font-light text-brand">{subtitle}</p>
          {showInvitePopover && <InvitePopover />}
        </div>

        <ActionButtons onSignIn={onSignIn} onCreateAccount={onCreateAccount} />

        <footer className="mt-6">
          <p className="text-sm text-muted-foreground opacity-80 md:pr-13">
            By creating a Pubky account, you agree to the <DialogTerms linkText="Terms of Service" />,{' '}
            <DialogPrivacy linkText="Privacy Policy" />, and confirm you are <DialogAge linkText="over 18 years old." />{' '}
            Pubky is powered by{' '}
            <a className="cursor-pointer text-brand" target="_blank" href="https://pubky.org/">
              Pubky Core
            </a>{' '}
            and was built with love and dedication by Synonym Software Ltd. ©2025.
          </p>
        </footer>
      </div>
    </div>
  );
}
