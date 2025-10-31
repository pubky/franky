'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export interface ProfileInfoProps {
  links?: Array<{ label: string; url: string }>;
  tags?: Array<{ label: string; count: number }>;
  className?: string;
}

const getLinkIcon = (url: string) => {
  const domain = url.toLowerCase();
  if (domain.includes('x.com') || domain.includes('twitter.com')) {
    return Libs.XTwitter;
  }
  if (domain.includes('github.com')) {
    return Libs.Github2;
  }
  if (domain.includes('telegram')) {
    return Libs.Telegram;
  }
  if (domain.includes('youtube.com')) {
    return Libs.Video;
  }
  return Libs.Link;
};

export function ProfileInfo({ links, tags, className }: ProfileInfoProps) {
  return (
    <div className={Libs.cn('flex flex-col gap-6', className)}>
      {/* Tagged as Section */}
      {tags && tags.length > 0 && (
        <Atoms.Container className="flex flex-col gap-2">
          <Atoms.Heading level={2} size="lg" className="text-muted-foreground font-light">
            Tagged as
          </Atoms.Heading>

          {tags.map((tag, index) => (
            <div key={index} className="flex items-center gap-2">
              <Atoms.Tag name={tag.label} count={tag.count} className="flex-1" />
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary shadow-xs hover:bg-secondary/80 transition-colors">
                <Libs.Search className="h-4 w-4" />
              </button>
            </div>
          ))}

          <Atoms.SidebarButton icon={Libs.Tag}>Tag yourself</Atoms.SidebarButton>
        </Atoms.Container>
      )}

      {/* Links Section */}
      {links && links.length > 0 && (
        <Atoms.Container className="flex flex-col gap-2">
          <Atoms.Heading level={2} size="lg" className="text-muted-foreground font-light">
            Links
          </Atoms.Heading>

          <div className="flex flex-col gap-2">
            {links.map((link, index) => {
              const IconComponent = getLinkIcon(link.url);
              const displayLabel = link.label || new URL(link.url).hostname.replace('www.', '');
              return (
                <a
                  key={index}
                  href="https://google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-base font-medium text-secondary-foreground leading-6 hover:text-foreground/80 hover:opacity-50 transition-colors cursor-pointer"
                >
                  <IconComponent size={16} className="shrink-0" />
                  <span>{displayLabel}</span>
                </a>
              );
            })}
          </div>
        </Atoms.Container>
      )}

      {/* Feedback Section */}
      <Molecules.FeedbackCard />
    </div>
  );
}
