'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Providers from '@/providers';
import { MAX_SIDEBAR_TAGS } from './ProfilePageSidebar.constants';

export function ProfilePageSidebar() {
  const pathname = usePathname();

  // Get the profile pubky from context
  const { pubky } = Providers.useProfileContext();

  // Get user profile data for the target user
  const { profile } = Hooks.useUserProfile(pubky ?? '');

  const {
    tags,
    isLoading: isLoadingTags,
    handleTagToggle,
  } = Hooks.useTagged(pubky, {
    enablePagination: false,
    enableStats: false,
  });

  // Show only top 5 most popular tags (sorted by taggers_count)
  const topTags = useMemo(() => {
    return [...tags].sort((a, b) => (b.taggers_count ?? 0) - (a.taggers_count ?? 0)).slice(0, MAX_SIDEBAR_TAGS);
  }, [tags]);

  const isTaggedPage = pathname?.endsWith('/tagged');

  // Only apply sticky when content fits in viewport
  // Profile page header height is 146px (--header-height in globals.css)
  const { ref, shouldBeSticky } = Hooks.useStickyWhenFits({
    topOffset: 146, // Account for profile page header (--header-height: 146px)
    bottomOffset: 48, // Account for bottom padding
  });

  return (
    <Atoms.Container
      ref={ref}
      overrideDefaults={true}
      className={Libs.cn(
        'hidden w-(--filter-bar-width) flex-col gap-6 self-start lg:flex',
        shouldBeSticky && 'sticky top-(--header-height)',
      )}
    >
      {!isTaggedPage && (
        <Molecules.ProfilePageTaggedAs
          tags={topTags}
          isLoading={isLoadingTags}
          onTagClick={handleTagToggle}
          pubky={pubky ?? ''}
          userName={profile?.name}
        />
      )}
      <Molecules.ProfilePageLinks links={profile?.links} />
      <Organisms.FeedbackCard />
    </Atoms.Container>
  );
}
