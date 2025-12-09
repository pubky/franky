'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { APP_ROUTES } from '@/app/routes';
import type { HotTagsCardsSectionProps } from './HotTagsCardsSection.types';
import {
  TOP_TAGS_DISPLAY,
  MAX_AVATARS_MOBILE,
  MAX_AVATARS_DEFAULT,
  MAX_AVATARS_XL,
} from './HotTagsCardsSection.constants';

/**
 * HotTagsCardsSection
 *
 * Organism that displays the top 3 trending tags as featured cards.
 * Fetches hot tags based on reach and timeframe filters from the hot store.
 */
export function HotTagsCardsSection({ className }: HotTagsCardsSectionProps) {
  const router = useRouter();
  const { reach, timeframe } = Core.useHotStore();

  // Fetch hot tags using the hook (no limit - get all from endpoint)
  const { rawTags, isLoading } = Hooks.useHotTags({
    reach: reach === 'all' ? undefined : (reach as Core.UserStreamReach),
    timeframe,
  });

  // Display only the top tags as featured cards
  const featuredTags = useMemo(() => rawTags.slice(0, TOP_TAGS_DISPLAY), [rawTags]);

  // Responsive avatar count based on screen size
  const isMobile = Hooks.useIsMobile({ breakpoint: 'sm' }); // < 640px
  const isBelowXL = Hooks.useIsMobile({ breakpoint: 'xl' }); // < 1280px

  const maxAvatars = isMobile ? MAX_AVATARS_MOBILE : isBelowXL ? MAX_AVATARS_DEFAULT : MAX_AVATARS_XL;

  // Collect all unique tagger IDs from featured tags only
  const allTaggerIds = useMemo(() => {
    const ids = new Set<Core.Pubky>();
    for (const tag of featuredTags) {
      for (const taggerId of tag.taggers_id) {
        ids.add(taggerId);
      }
    }
    return Array.from(ids);
  }, [featuredTags]);

  // Get user avatars for all taggers
  const { getUsersWithAvatars } = Hooks.useBulkUserAvatars(allTaggerIds);

  const handleTagClick = (tagName: string) => {
    router.push(`${APP_ROUTES.SEARCH}?tags=${encodeURIComponent(tagName)}`);
  };

  // TODO: Replace with Skeleton component
  if (isLoading) {
    return (
      <Atoms.Container overrideDefaults className={Libs.cn('flex flex-col gap-2', className)}>
        <Atoms.Heading level={5} size="lg" className="font-light text-muted-foreground">
          Trending
        </Atoms.Heading>
        <Atoms.Typography className="font-light text-muted-foreground">Loading...</Atoms.Typography>
      </Atoms.Container>
    );
  }

  if (featuredTags.length === 0) {
    return null;
  }

  return (
    <Atoms.Container
      overrideDefaults
      className={Libs.cn('flex flex-col gap-2', className)}
      data-testid="hot-tags-cards-section"
    >
      <Atoms.Heading level={5} size="lg" className="font-light text-muted-foreground">
        Trending
      </Atoms.Heading>
      <Atoms.Container overrideDefaults className="flex flex-col gap-3 sm:flex-row">
        {featuredTags.map((tag, index) => (
          <Molecules.HotTagCard
            key={tag.label}
            rank={index + 1}
            tagName={tag.label}
            postCount={tag.tagged_count}
            taggers={getUsersWithAvatars(tag.taggers_id)}
            maxAvatars={maxAvatars}
            onClick={handleTagClick}
          />
        ))}
      </Atoms.Container>
    </Atoms.Container>
  );
}
