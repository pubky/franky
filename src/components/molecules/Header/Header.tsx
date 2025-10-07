'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Config from '@/config';
import * as App from '@/app';

export const HeaderContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Atoms.Container
      as="header"
      size="container"
      className="flex py-6 items-center px-6 sticky top-0 z-10 bg-gradient-to-b from-[var(--background)] to-[var(--transparent)] h-[96px] md:h-[144px]"
    >
      <Atoms.Container as="nav" className="flex-row items-center py-0 md:py-6 gap-6 w-full h-full">
        {children}
      </Atoms.Container>
    </Atoms.Container>
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
  const counterString = counter > 21 ? '21+' : counter.toString();

  return (
    <Atoms.Container className="flex flex-row w-auto justify-start items-center gap-3">
      <Atoms.Link href={App.FEED_ROUTES.FEED}>
        <Atoms.Button className="w-12 h-12" variant="secondary" size="icon">
          <Libs.Home className="size-6" />
        </Atoms.Button>
      </Atoms.Link>
      <Atoms.Link className="sm:hidden" href="/search">
        <Atoms.Button className="w-12 h-12 border bg-transparent" variant="secondary" size="icon">
          <Libs.Search className="size-6" />
        </Atoms.Button>
      </Atoms.Link>
      <Atoms.Link href="/bookmarks">
        <Atoms.Button className="w-12 h-12 border bg-transparent" variant="secondary" size="icon">
          <Libs.Bookmark className="size-6" />
        </Atoms.Button>
      </Atoms.Link>
      <Atoms.Link href="/settings">
        <Atoms.Button className="w-12 h-12 border bg-transparent" variant="secondary" size="icon">
          <Libs.Settings className="size-6" />
        </Atoms.Button>
      </Atoms.Link>
      <Atoms.Link className="relative" href="/profile">
        <Atoms.Avatar className="w-12 h-12">
          <Atoms.AvatarImage src={avatarImage || undefined} />
          <Atoms.AvatarFallback>{avatarInitial}</Atoms.AvatarFallback>
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
