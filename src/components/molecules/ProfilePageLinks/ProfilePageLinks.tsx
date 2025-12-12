'use client';

import { useMemo, useState, useCallback } from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Core from '@/core';
import * as Organisms from '@/organisms';
import type { ProfilePageLinksProps } from './ProfilePageLinks.types';

export function ProfilePageLinks({ links }: ProfilePageLinksProps) {
  const { privacy } = Core.useSettingsStore();
  const checkLinkEnabled = privacy.showConfirm;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clickedLink, setClickedLink] = useState('');

  // Transform raw links from Nexus into the format we need for rendering
  const transformedLinks = useMemo(
    () =>
      links?.map((link) => ({
        icon: Libs.getIconFromUrl(link.url),
        label: link.title,
        url: link.url,
      })) || [],
    [links],
  );

  const handleLinkClick = useCallback(
    (url: string, e: React.MouseEvent) => {
      e.preventDefault();

      // mailto: links bypass check
      if (url.startsWith('mailto:')) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }

      // If checkLink is disabled (false), open directly
      if (checkLinkEnabled === false) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }

      // Show dialog
      setClickedLink(url);
      setDialogOpen(true);
    },
    [checkLinkEnabled],
  );

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
  }, []);

  return (
    <>
      <Atoms.Container>
        <Atoms.Heading level={2} size="lg" className="font-light text-muted-foreground">
          Links
        </Atoms.Heading>

        <Atoms.Container>
          {transformedLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <a
                key={index}
                href={link.url}
                onClick={(e) => handleLinkClick(link.url, e)}
                className="flex cursor-pointer items-center gap-2.5 py-1"
              >
                <Icon size={16} className="shrink-0 text-foreground" />
                <Atoms.Typography as="span" className="flex-1 text-base font-medium text-secondary-foreground">
                  {link.label}
                </Atoms.Typography>
              </a>
            );
          })}
          {transformedLinks.length === 0 && (
            <Atoms.Container className="mt-2 flex flex-col">
              <Atoms.Typography as="span" className="text-base font-medium text-muted-foreground">
                No links added yet.
              </Atoms.Typography>
            </Atoms.Container>
          )}
        </Atoms.Container>
      </Atoms.Container>

      <Organisms.DialogCheckLink open={dialogOpen} onOpenChangeAction={handleDialogOpenChange} linkUrl={clickedLink} />
    </>
  );
}
