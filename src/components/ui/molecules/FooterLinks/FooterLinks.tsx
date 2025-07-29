import { ReactNode } from 'react';
import { cn } from '@/libs';

interface LinkItem {
  text: string;
  href: string;
  target?: string;
}

interface FooterLinksProps {
  children: ReactNode;
  links?: LinkItem[];
  className?: string;
}

export function FooterLinks({ children, links = [], className }: FooterLinksProps) {
  return (
    <p className={cn('text-sm text-muted-foreground opacity-80', className)}>
      {children}
      {links.map((link, index) => (
        <a key={index} href={link.href} className="text-brand" target={link.target}>
          {link.text}
        </a>
      ))}
    </p>
  );
}
