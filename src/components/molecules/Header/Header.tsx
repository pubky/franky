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
        'sticky top-0 z-20 w-full bg-gradient-to-b from-[var(--background)]/95 to-[var(--transparent)] py-6 backdrop-blur-sm',
        className,
      )}
    >
      <Atoms.Container
        size="container"
        className={Libs.cn(
          'flex flex-row flex-wrap items-center justify-between gap-4 sm:gap-6',
          'px-4 py-4 sm:px-6 sm:py-6',
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
    <Atoms.Container className="hidden flex-1 md:flex">
      <Atoms.Heading level={2} size="lg" className="font-normal text-muted-foreground">
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
    <Atoms.Container
      data-testid="header-social-links"
      className={Libs.cn('mr-6 hidden flex-row justify-end gap-6 md:flex', props.className)}
    >
      <Atoms.Link href={Config.GITHUB_URL} target="_blank" variant="muted" size="default">
        <Libs.Github2 className="h-6 w-6" />
      </Atoms.Link>
      <Atoms.Link href={Config.TWITTER_GETPUBKY_URL} target="_blank" variant="muted" size="default">
        <Libs.XTwitter className="h-6 w-6" />
      </Atoms.Link>
      <Atoms.Link href={Config.TELEGRAM_URL} target="_blank" variant="muted" size="default">
        <Libs.Telegram className="h-6 w-6" />
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

  const isActive = (path: string) => pathname === path;

  return (
    <Atoms.Container className="hidden w-auto flex-row items-center justify-start gap-3 lg:flex">
      <Atoms.Link href={App.APP_ROUTES.HOME}>
        <Atoms.Button
          className={Libs.cn('h-12 w-12', isActive(App.APP_ROUTES.HOME) ? '' : 'border bg-transparent')}
          variant="secondary"
          size="icon"
        >
          <Libs.Home className="size-6" />
        </Atoms.Button>
      </Atoms.Link>

      <Atoms.Link href={App.APP_ROUTES.HOT}>
        <Atoms.Button
          className={Libs.cn('h-12 w-12', isActive(App.APP_ROUTES.HOT) ? '' : 'border bg-transparent')}
          variant="secondary"
          size="icon"
        >
          <Libs.Flame className="size-6" />
        </Atoms.Button>
      </Atoms.Link>

      <Atoms.Link href={App.APP_ROUTES.BOOKMARKS}>
        <Atoms.Button
          className={Libs.cn('h-12 w-12', isActive(App.APP_ROUTES.BOOKMARKS) ? '' : 'border bg-transparent')}
          variant="secondary"
          size="icon"
        >
          <Libs.Bookmark className="size-6" />
        </Atoms.Button>
      </Atoms.Link>

      <Atoms.Link href={App.APP_ROUTES.SETTINGS}>
        <Atoms.Button
          className={Libs.cn('h-12 w-12', isActive(App.APP_ROUTES.SETTINGS) ? '' : 'border bg-transparent')}
          variant="secondary"
          size="icon"
        >
          <Libs.Settings className="size-6" />
        </Atoms.Button>
      </Atoms.Link>

      <Atoms.Link id="header-nav-profile-btn" className="relative" href={App.APP_ROUTES.PROFILE}>
        <Atoms.Avatar className="h-12 w-12 cursor-pointer">
          <Atoms.AvatarImage src={avatarImage} alt="Profile" />
          <Atoms.AvatarFallback>{avatarInitial}</Atoms.AvatarFallback>
        </Atoms.Avatar>
        {counter > 0 && (
          <Atoms.Badge className={`absolute right-0 bottom-0 h-5 w-5 rounded-full bg-brand`} variant="secondary">
            <Atoms.Typography className={`text-primary-foreground ${counter > 21 ? 'text-xs' : ''}`} size="sm">
              {counterString}
            </Atoms.Typography>
          </Atoms.Badge>
        )}
      </Atoms.Link>
    </Atoms.Container>
  );
}
