'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface ProfilePageSidebarLink {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  url: string;
  label: string;
}

export interface ProfilePageLinksProps {
  links?: ProfilePageSidebarLink[];
}

export const DEFAULT_LINKS: ProfilePageSidebarLink[] = [
  { icon: Libs.Link, url: 'https://bitcoin.org', label: 'bitcoin.org' },
  { icon: Libs.XTwitter, url: 'https://x.com', label: 'x.com' },
  { icon: Libs.CirclePlay, url: 'https://youtube.com', label: 'youtube.com' },
  { icon: Libs.Telegram, url: 'https://telegram.chat', label: 'telegram.chat' },
];

export function ProfilePageLinks({ links = DEFAULT_LINKS }: ProfilePageLinksProps) {
  return (
    <div className="flex flex-col">
      <Atoms.Heading level={2} size="lg" className="font-light text-muted-foreground">
        Links
      </Atoms.Heading>

      <div className="flex flex-col">
        {links.map((link, index) => {
          const Icon = link.icon;
          return (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 py-1"
            >
              <Icon size={16} className="shrink-0 text-foreground" />
              <span className="flex-1 text-base font-medium text-secondary-foreground">{link.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
