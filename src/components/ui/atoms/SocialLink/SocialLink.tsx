import { ReactNode } from 'react';

interface SocialLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function SocialLink({
  href,
  children,
  className = 'text-muted-foreground hover:text-foreground transition-colors',
}: SocialLinkProps) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
