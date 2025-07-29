import { ReactNode } from 'react';
import { cn } from '@/libs';

interface BrandLinkProps {
  children: ReactNode;
  href: string;
  className?: string;
  target?: string;
  external?: boolean;
}

export function BrandLink({ children, href, className, target, external = false }: BrandLinkProps) {
  return (
    <a
      href={href}
      className={cn('text-brand cursor-pointer', className)}
      target={target || (external ? '_blank' : undefined)}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  );
}
