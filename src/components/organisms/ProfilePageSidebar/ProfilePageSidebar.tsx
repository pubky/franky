'use client';

import { useState, useEffect } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Icons from '@/libs/icons';

export function ProfilePageSidebar() {
  const [links, setLinks] = useState<Molecules.ProfilePageSidebarLink[]>([]);
  const [tags] = useState<Array<{ name: string; count?: number }>>([]);
  const { currentUserPubky } = Core.useAuthStore();

  const userDetails = useLiveQuery(async () => {
    if (!currentUserPubky) return null;
    return await Core.ProfileController.read({ userId: currentUserPubky });
  }, [currentUserPubky]);

  useEffect(() => {
    if (userDetails) {
      setLinks(
        userDetails.links?.map((link) => ({
          icon: Icons.getIconFromUrl(link.url),
          label: link.title,
          url: link.url,
        })) || [],
      );
    }
  }, [userDetails]);

  return (
    <Atoms.Container
      overrideDefaults={true}
      className="sticky top-(--header-height) hidden w-(--filter-bar-width) flex-col gap-6 self-start lg:flex"
    >
      <Molecules.ProfilePageTaggedAs tags={tags} />
      <Molecules.ProfilePageLinks links={links} />
      <Molecules.FeedbackCard />
    </Atoms.Container>
  );
}
