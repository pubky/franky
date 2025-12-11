import * as React from 'react';

export interface HeaderContainerProps {
  children: React.ReactNode;
  className?: string;
}

export type NavigationItem = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

export type HeaderNavigationButtonsProps = {
  counter?: number;
  avatarImage?: string;
  avatarInitial?: string;
};
