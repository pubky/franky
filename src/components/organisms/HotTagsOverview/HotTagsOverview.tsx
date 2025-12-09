'use client';

import { useRouter } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
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

  // Fetch hot tags using the hook
  const { rawTags: tags, isLoading } = Hooks.useHotTags({
    reach: reach === 'all' ? undefined : (reach as Core.UserStreamReach),
    timeframe,
    limit,
  });

  const handleTagClick = (tagName: string) => {
    router.push(`${APP_ROUTES.SEARCH}?tags=${encodeURIComponent(tagName)}`);
  };

  return (
    <Atoms.Container
      overrideDefaults
      className={Libs.cn('flex flex-col gap-2', className)}
      data-testid="hot-tags-overview"
    >
      <Atoms.Heading level={5} size="lg" className="font-light text-muted-foreground">
        Hot tags
      </Atoms.Heading>
      {isLoading ? (
        // TODO: Replace with Skeleton component
        <Atoms.Typography className="font-light text-muted-foreground">Loading...</Atoms.Typography>
      ) : tags.length === 0 ? (
        <Atoms.Typography className="font-light text-muted-foreground">No tags to show</Atoms.Typography>
      ) : (
        <Atoms.Container overrideDefaults className="flex flex-wrap content-start gap-2">
          {tags.map((tag) => (
            <Atoms.Tag key={tag.label} name={tag.label} count={tag.tagged_count} onClick={handleTagClick} />
          ))}
        </Atoms.Container>
      )}
    </Atoms.Container>
  );
}
