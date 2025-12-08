'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { APP_ROUTES } from '@/app/routes';
import type { HotTagsOverviewProps } from './HotTagsOverview.types';

const DEFAULT_TAGS_LIMIT = 50;

/**
 * HotTagsOverview
 *
 * Organism that displays a grid of trending tags.
 * Fetches hot tags based on reach and timeframe filters from the hot store.
 */
export function HotTagsOverview({ limit = DEFAULT_TAGS_LIMIT, className }: HotTagsOverviewProps) {
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
        limit,
      });
      setTags(hotTags);
    } catch (error) {
      Libs.Logger.error('[HotTagsOverview] Failed to fetch hot tags:', error);
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  }, [reach, timeframe, limit]);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  const handleTagClick = (tagName: string) => {
    router.push(`${APP_ROUTES.SEARCH}?tags=${encodeURIComponent(tagName)}`);
  };

  // TODO: Replace with Skeleton component
  if (isLoading) {
    return (
      <Atoms.Container overrideDefaults className={Libs.cn('flex flex-wrap gap-2', className)}>
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
      className={Libs.cn('flex flex-wrap content-start gap-2', className)}
      data-testid="hot-tags-overview"
    >
      {tags.map((tag) => (
        <Atoms.Tag key={tag.label} name={tag.label} count={tag.tagged_count} onClick={handleTagClick} />
      ))}
    </Atoms.Container>
  );
}
