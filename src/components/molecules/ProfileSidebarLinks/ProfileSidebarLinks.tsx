'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface ProfileLink {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ProfileSidebarLinksProps {
  links: ProfileLink[];
  className?: string;
  'data-testid'?: string;
}

// Social platform URL patterns
const SOCIAL_PLATFORMS = {
  TWITTER: ['twitter.com', 'x.com'],
  GITHUB: ['github.com'],
  TELEGRAM: ['t.me', 'telegram'],
  LINKEDIN: ['linkedin.com'],
  INSTAGRAM: ['instagram.com'],
  FACEBOOK: ['facebook.com'],
  YOUTUBE: ['youtube.com'],
  MAILTO: ['mailto:'],
} as const;

// Map of social platform URLs to icons
const getSocialIcon = (url: string): React.ComponentType<{ className?: string }> => {
  const lowerUrl = url.toLowerCase();

  switch (true) {
    case SOCIAL_PLATFORMS.TWITTER.some((pattern) => lowerUrl.includes(pattern)):
      return Libs.XTwitter;

    case SOCIAL_PLATFORMS.GITHUB.some((pattern) => lowerUrl.includes(pattern)):
      return Libs.Github2;

    case SOCIAL_PLATFORMS.TELEGRAM.some((pattern) => lowerUrl.includes(pattern)):
      return Libs.Telegram;

    case SOCIAL_PLATFORMS.LINKEDIN.some((pattern) => lowerUrl.includes(pattern)):
      return Libs.Linkedin;

    case SOCIAL_PLATFORMS.INSTAGRAM.some((pattern) => lowerUrl.includes(pattern)):
      return Libs.Instagram;

    case SOCIAL_PLATFORMS.FACEBOOK.some((pattern) => lowerUrl.includes(pattern)):
      return Libs.Facebook;

    case SOCIAL_PLATFORMS.YOUTUBE.some((pattern) => lowerUrl.includes(pattern)):
      return Libs.Youtube;

    case SOCIAL_PLATFORMS.MAILTO.some((pattern) => lowerUrl.includes(pattern)):
      return Libs.Mail;

    default:
      return Libs.Link2;
  }
};

const extractUsername = (url: string): string => {
  try {
    // Handle mailto links
    if (url.startsWith('mailto:')) {
      return url.replace('mailto:', '');
    }

    // Remove trailing slash
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;

    // Extract username from URL
    const urlObj = new URL(cleanUrl);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);

    if (pathSegments.length > 0) {
      return pathSegments[pathSegments.length - 1];
    }

    // If no path, return hostname without www
    return urlObj.hostname.replace('www.', '');
  } catch {
    // If URL parsing fails, return the original
    return url.replace(/^(https?:\/\/(www\.)?|www\.)/, '');
  }
};

export function ProfileSidebarLinks({ links, className, 'data-testid': dataTestId }: ProfileSidebarLinksProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <Atoms.FilterRoot className={className} data-testid={dataTestId || 'profile-sidebar-links'}>
      <Atoms.FilterHeader title="Links" />
      <div className="flex flex-col gap-2 mt-2">
        {links.map((link, index) => {
          const Icon = link.icon || getSocialIcon(link.url) || Libs.Link2;
          const displayText = extractUsername(link.url);
          const isMailto = link.url.startsWith('mailto:');

          return (
            <a
              key={index}
              href={link.url}
              target={isMailto ? undefined : '_blank'}
              rel={isMailto ? undefined : 'noopener noreferrer'}
              className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
              data-testid={`profile-link-${index}`}
            >
              <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Atoms.Typography
                size="sm"
                className="text-muted-foreground group-hover:text-foreground break-all transition-colors"
              >
                {displayText}
              </Atoms.Typography>
            </a>
          );
        })}
      </div>
    </Atoms.FilterRoot>
  );
}
