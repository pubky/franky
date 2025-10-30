'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Config from '@/config';
import * as App from '@/app';

type HeaderContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export const HeaderContainer = ({ children, className }: HeaderContainerProps) => {
  return (
    <header
      className={Libs.cn(
        'sticky top-0 z-20 w-full bg-gradient-to-b from-[var(--background)]/95 to-[var(--transparent)] backdrop-blur-sm py-6',
        className,
      )}
    >
      <Atoms.Container
        size="container"
        className={Libs.cn(
          'flex flex-row flex-wrap items-center justify-between gap-4 sm:gap-6',
          'px-4 sm:px-6 py-4 sm:py-6',
        )}
      >
        <Atoms.Container
          as="nav"
          className="flex w-full flex-row flex-wrap items-center gap-4 sm:flex-nowrap sm:items-center sm:gap-6"
        >
          {children}
        </Atoms.Container>
      </Atoms.Container>
    </header>
  );
};

export const HeaderTitle = ({ currentTitle }: { currentTitle: string }) => {
  return (
    <Atoms.Container className="flex-1 hidden md:flex">
      <Atoms.Heading level={2} size="lg" className="text-muted-foreground font-normal">
        {currentTitle}
      </Atoms.Heading>
    </Atoms.Container>
  );
};

export const HeaderOnboarding = ({ currentStep }: { currentStep: number }) => {
  return <Molecules.ProgressSteps currentStep={currentStep} totalSteps={5} />;
};

export function HeaderSocialLinks({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Atoms.Container className={Libs.cn('hidden md:flex flex-row justify-end gap-6 mr-6', props.className)}>
      <Atoms.Link href={Config.GITHUB_URL} target="_blank" variant="muted" size="default">
        <Libs.Github2 className="w-6 h-6" />
      </Atoms.Link>
      <Atoms.Link href={Config.TWITTER_GETPUBKY_URL} target="_blank" variant="muted" size="default">
        <Libs.XTwitter className="w-6 h-6" />
      </Atoms.Link>
      <Atoms.Link href={Config.TELEGRAM_URL} target="_blank" variant="muted" size="default">
        <Libs.Telegram className="w-6 h-6" />
      </Atoms.Link>
    </Atoms.Container>
  );
}

type HeaderNavigationButtonsProps = {
  counter?: number;
  avatarImage?: string;
  avatarInitial?: string;
};

export function HeaderNavigationButtons({
  counter = 0,
  avatarImage,
  avatarInitial = 'U',
}: HeaderNavigationButtonsProps) {
  const pathname = usePathname();
  const counterString = counter > 21 ? '21+' : counter.toString();

  const isActive = (path: string) => {
    // Exact match
    if (pathname === path) return true;

    // Check if current path starts with the route path (for nested routes)
    // This handles cases like /settings/account, /profile/posts, etc.
    if (pathname.startsWith(path + '/')) return true;

    return false;
  };

  return (
    <Atoms.Container className="hidden w-auto flex-row items-center justify-start gap-3 lg:flex">
      <Atoms.Link href={App.APP_ROUTES.HOME}>
        <Atoms.Button
          className={Libs.cn('w-12 h-12', isActive(App.APP_ROUTES.HOME) ? '' : 'border bg-transparent')}
          variant="secondary"
          size="icon"
        >
          <Libs.Home className="size-6" />
        </Atoms.Button>
      </Atoms.Link>

      <Atoms.Link href={App.APP_ROUTES.HOT}>
        <Atoms.Button
          className={Libs.cn('w-12 h-12', isActive(App.APP_ROUTES.HOT) ? '' : 'border bg-transparent')}
          variant="secondary"
          size="icon"
        >
          <Libs.Flame className="size-6" />
        </Atoms.Button>
      </Atoms.Link>

      <Atoms.Link href={App.APP_ROUTES.BOOKMARKS}>
        <Atoms.Button
          className={Libs.cn('w-12 h-12', isActive(App.APP_ROUTES.BOOKMARKS) ? '' : 'border bg-transparent')}
          variant="secondary"
          size="icon"
        >
          <Libs.Bookmark className="size-6" />
        </Atoms.Button>
      </Atoms.Link>

      <Atoms.Link href={App.APP_ROUTES.SETTINGS}>
        <Atoms.Button
          className={Libs.cn('w-12 h-12', isActive(App.APP_ROUTES.SETTINGS) ? '' : 'border bg-transparent')}
          variant="secondary"
          size="icon"
        >
          <Libs.Settings className="size-6" />
        </Atoms.Button>
      </Atoms.Link>

      <Atoms.Link id="header-nav-profile-btn" className="relative" href={App.APP_ROUTES.PROFILE}>
        <Atoms.Avatar size="lg">
          <Atoms.AvatarImage src={avatarImage} alt="Profile" />
          <Atoms.AvatarFallback active={isActive(App.APP_ROUTES.PROFILE)}>{avatarInitial}</Atoms.AvatarFallback>
        </Atoms.Avatar>
        {counter > 0 && (
          <Atoms.Badge className={`absolute bottom-0 right-0 rounded-full bg-brand h-5 w-5`} variant="secondary">
            <Atoms.Typography className={`text-primary-foreground ${counter > 21 ? 'text-xs' : ''}`} size="sm">
              {counterString}
            </Atoms.Typography>
          </Atoms.Badge>
        )}
      </Atoms.Link>
    </Atoms.Container>
  );
}
