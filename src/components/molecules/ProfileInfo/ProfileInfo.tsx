'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface ProfileInfoProps {
  bio?: string;
  links?: Array<{ label: string; url: string }>;
  tags?: Array<{ label: string; count: number }>;
  className?: string;
}

export function ProfileInfo({ bio, links, tags, className }: ProfileInfoProps) {
  return (
    <Atoms.Container className={Libs.cn('flex flex-col gap-6', className)}>
      {/* Bio Section */}
      {bio && (
        <Atoms.Card className="p-4">
          <Atoms.Heading level={3} size="md" className="mb-2">
            Bio
          </Atoms.Heading>
          <Atoms.Typography size="sm" className="text-muted-foreground break-words whitespace-pre-wrap">
            {bio}
          </Atoms.Typography>
        </Atoms.Card>
      )}

      {/* Links Section */}
      {links && links.length > 0 && (
        <Atoms.Card className="p-4">
          <Atoms.Heading level={3} size="md" className="mb-3">
            Links
          </Atoms.Heading>
          <Atoms.Container className="flex flex-col gap-2">
            {links.map((link, index) => (
              <Atoms.Link
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-foreground transition-colors"
              >
                <Libs.ExternalLink size={14} />
                <span className="truncate">{link.label || link.url}</span>
              </Atoms.Link>
            ))}
          </Atoms.Container>
        </Atoms.Card>
      )}

      {/* Tags Section */}
      {tags && tags.length > 0 && (
        <Atoms.Card className="p-4">
          <Atoms.Heading level={3} size="md" className="mb-3">
            Top Tags
          </Atoms.Heading>
          <Atoms.Container className="flex flex-col gap-2">
            {tags.map((tag, index) => (
              <Atoms.Container key={index} className="flex items-center justify-between">
                <Atoms.Container className="flex items-center gap-2">
                  <Libs.Tag size={14} className="text-muted-foreground" />
                  <Atoms.Typography size="sm" className="truncate">
                    {tag.label}
                  </Atoms.Typography>
                </Atoms.Container>
                <Atoms.Badge variant="secondary" className="ml-2">
                  {tag.count}
                </Atoms.Badge>
              </Atoms.Container>
            ))}
          </Atoms.Container>
        </Atoms.Card>
      )}
    </Atoms.Container>
  );
}

