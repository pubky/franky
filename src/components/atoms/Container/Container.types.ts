import type { ReactNode } from 'react';

export type ContainerElement =
  | 'div'
  | 'section'
  | 'article'
  | 'main'
  | 'header'
  | 'footer'
  | 'aside'
  | 'nav'
  | 'body'
  | 'html'
  | 'figure';
export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'container' | 'default';
export type ContainerDisplay = 'flex' | 'grid' | 'block';

export type ContainerProps = {
  as?: ContainerElement | 'div';
  children?: ReactNode;
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  size?: ContainerSize;
  display?: ContainerDisplay;
  overrideDefaults?: boolean;
  'data-testid'?: string;
  role?: React.HTMLAttributes<HTMLElement>['role'];
  onClick?: React.HTMLAttributes<HTMLElement>['onClick'];
  style?: React.CSSProperties;
  title?: string;
  'aria-modal'?: boolean | 'true' | 'false';
  'aria-label'?: string;
  tabIndex?: number;
};

export interface ContainerElementProps extends React.HTMLAttributes<HTMLElement> {
  ref?: React.Ref<HTMLDivElement>;
  'data-testid'?: string;
}
