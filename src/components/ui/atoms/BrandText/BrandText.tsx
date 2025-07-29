import { ReactNode } from 'react';
import { cn } from '@/libs';

interface BrandTextProps {
  children: ReactNode;
  className?: string;
  inline?: boolean;
}

export function BrandText({ children, className, inline = false }: BrandTextProps) {
  return (
    <span className={cn('text-brand', !inline && 'block md:inline', inline && 'inline', className)}>{children}</span>
  );
}
