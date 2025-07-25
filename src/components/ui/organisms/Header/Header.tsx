'use client';

import { LogIn } from 'lucide-react';
import { Logo, Button, SocialLinks } from '@/components/ui';

interface HeaderProps {
  className?: string;
  onSignIn?: () => void;
  showSocialLinks?: boolean;
  githubUrl?: string;
  twitterUrl?: string;
  telegramUrl?: string;
}

export function Header({
  className = '',
  onSignIn,
  showSocialLinks = true,
  githubUrl = '#',
  twitterUrl = '#',
  telegramUrl = '#',
}: HeaderProps) {
  return (
    <header className={className}>
      <div className="container mx-auto px-6 lg:px-10 py-6 ">
        <nav className="flex justify-between items-center h-16 mt-1">
          <div className="flex items-center">
            <Logo />
          </div>

          <div className="flex items-center gap-6">
            {showSocialLinks && <SocialLinks githubUrl={githubUrl} twitterUrl={twitterUrl} telegramUrl={telegramUrl} />}
            <Button variant="secondary" size="default" className="rounded-full" onClick={onSignIn}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
