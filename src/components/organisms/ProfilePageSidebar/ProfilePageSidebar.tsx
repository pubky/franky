'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Providers from '@/providers';
import * as Config from '@/config';
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
  const { ref, shouldBeSticky } = Hooks.useStickyWhenFits({
    topOffset: Config.LAYOUT.HEADER_HEIGHT_PROFILE,
    bottomOffset: Config.LAYOUT.SIDEBAR_BOTTOM_OFFSET,
  });

  return (
    <Atoms.Container
      ref={ref}
      overrideDefaults={true}
      className={Libs.cn(
        'hidden w-(--filter-bar-width) flex-col gap-6 self-start lg:flex',
        // Use !== false to treat undefined (SSR) as sticky (optimistic assumption)
        shouldBeSticky !== false && 'sticky top-(--header-height)',
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
