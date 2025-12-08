'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { APP_ROUTES } from '@/app/routes';
import type { HotTagsCardsSectionProps } from './HotTagsCardsSection.types';

const TOP_TAGS_LIMIT = 3;

/**
 * HotTagsCardsSection
 *
 * Organism that displays the top 3 trending tags as featured cards.
 * Fetches hot tags based on reach and timeframe filters from the hot store.
 */
export function HotTagsCardsSection({ className }: HotTagsCardsSectionProps) {
  const router = useRouter();
  const { reach, timeframe } = Core.useHotStore();
  const [tags, setTags] = useState<Core.NexusHotTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const hotTags = await Core.HotController.getOrFetch({
        reach: reach === 'all' ? undefined : (reach as Core.UserStreamReach),
        timeframe,
        limit: TOP_TAGS_LIMIT,
      });
      setTags(hotTags);
    } catch (error) {
      Libs.Logger.error('[HotTagsCardsSection] Failed to fetch hot tags:', error);
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  }, [reach, timeframe]);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

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
        <Atoms.Typography size="md" className="text-muted-foreground">
          Loading...
        </Atoms.Typography>
      </Atoms.Container>
    );
  }

  if (tags.length === 0) {
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
      <Atoms.Container overrideDefaults className="flex gap-3">
        {tags.map((tag, index) => (
          <Molecules.HotTagCard
            key={tag.label}
            rank={index + 1}
            tagName={tag.label}
            postCount={tag.tagged_count}
            taggers={tag.taggers_id.map((id) => ({ id, name: undefined, avatarUrl: undefined }))}
            onClick={handleTagClick}
          />
        ))}
      </Atoms.Container>
    </Atoms.Container>
  );
}
