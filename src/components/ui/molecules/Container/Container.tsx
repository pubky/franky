import { ReactNode } from 'react';
import { cn } from '@/libs';

interface ContainerProps {
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer' | 'aside' | 'nav' | 'body' | 'html' | 'figure';
  children?: ReactNode;
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'container' | 'default';
  display?: 'flex' | 'grid' | 'block';
}

export function Container({
  as: Tag = 'div',
  size = 'default',
  display = 'flex',
  ...props
}: ContainerProps &
  React.HTMLAttributes<HTMLDivElement> &
  React.HTMLAttributes<HTMLHtmlElement> &
  React.HTMLAttributes<HTMLBodyElement>) {
  const defaultClasses = 'mx-auto w-full flex-col';
  const displayClasses = {
    flex: 'flex',
    grid: 'grid',
    block: 'block',
  };
  const sizeClasses = {
    default: '',
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    container: 'container',
  };

  const containerClassName = cn(defaultClasses, displayClasses[display], sizeClasses[size], props.className);

  return (
    <Tag {...props} className={containerClassName}>
      {props.children}
    </Tag>
  );
}
