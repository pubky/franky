'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Config from '@/config';
import { NAVIGATION_ITEMS } from './Header.constants';
import type { HeaderContainerProps, NavigationItem, HeaderNavigationButtonsProps } from './Header.types';

export type { HeaderContainerProps, NavigationItem, HeaderNavigationButtonsProps } from './Header.types';
export { NAVIGATION_ITEMS } from './Header.constants';

export const HeaderContainer = ({ children, className }: HeaderContainerProps): React.ReactElement => {
  return (
    <Atoms.Container
      overrideDefaults
      as="header"
      className={Libs.cn(
        'sticky top-0 z-(--z-sticky-header) w-full bg-linear-to-b from-(--background)/95 to-(--transparent) py-6 backdrop-blur-sm',
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
    </Atoms.Container>
  );
};

export const HeaderTitle = ({ currentTitle }: { currentTitle: string }): React.ReactElement => {
  return (
    <Atoms.Container className="hidden flex-1 md:flex">
      <Atoms.Heading level={2} size="lg" className="font-normal text-muted-foreground">
        {currentTitle}
      </Atoms.Heading>
    </Atoms.Container>
  );
};

export const HeaderOnboarding = ({ currentStep }: { currentStep: number }): React.ReactElement => {
  return <Molecules.ProgressSteps currentStep={currentStep} totalSteps={5} />;
};

export function HeaderSocialLinks({ ...props }: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
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

const NavigationButton = ({
  href,
  icon: Icon,
  isActive,
}: NavigationItem & { isActive: boolean }): React.ReactElement => (
  <Atoms.Link href={href}>
    <Atoms.Button
      className={Libs.cn('h-12 w-12', isActive ? '' : 'border bg-transparent')}
      variant="secondary"
      size="icon"
      aria-label={href}
    >
      <Icon className="size-6" />
    </Atoms.Button>
  </Atoms.Link>
);

export function HeaderNavigationButtons({
  counter = 0,
  avatarImage,
  avatarInitial = 'U',
}: HeaderNavigationButtonsProps): React.ReactElement {
  const pathname = usePathname();
  const counterString = counter > 21 ? '21+' : counter.toString();

  return (
    <Atoms.Container className="hidden w-auto flex-row items-center justify-start gap-3 lg:flex">
      {NAVIGATION_ITEMS.map((item) => (
        <NavigationButton key={item.href} {...item} isActive={pathname === item.href} />
      ))}

      <Atoms.Link data-cy="header-nav-profile-btn" className="relative" href={App.APP_ROUTES.PROFILE}>
        <Atoms.Avatar className="h-12 w-12 cursor-pointer">
          <Atoms.AvatarImage src={avatarImage} alt="Profile" />
          <Atoms.AvatarFallback>{avatarInitial}</Atoms.AvatarFallback>
        </Atoms.Avatar>
        {counter > 0 && (
          <Atoms.Badge className="absolute right-0 bottom-0 h-5 w-5 rounded-full bg-brand" variant="secondary">
            <Atoms.Typography className={Libs.cn('text-primary-foreground', counter > 21 && 'text-xs')} size="sm">
              {counterString}
            </Atoms.Typography>
          </Atoms.Badge>
        )}
      </Atoms.Link>
    </Atoms.Container>
  );
}
