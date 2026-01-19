'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface ArticleCharacterBreakdownProps {
  /** Title character count */
  titleCount: number;
  /** Title max characters */
  titleMax: number;
  /** Body character count */
  bodyCount: number;
  /** Total max characters (including title, body, and JSON overhead) */
  totalMax: number;
  /** JSON overhead characters */
  jsonOverhead: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Threshold percentages for warning states
 */
const WARNING_THRESHOLD = 0.8; // 80%
const DANGER_THRESHOLD = 0.95; // 95%

/**
 * ArticleCharacterBreakdown molecule
 *
 * Displays a detailed breakdown of character counts for articles:
 * - Title: current/max
 * - Body: current/max
 * - JSON overhead (fixed)
 * - Total: combined count
 *
 * This helps users understand the full character budget including
 * the JSON wrapper used when storing articles.
 */
export function ArticleCharacterBreakdown({
  titleCount,
  titleMax,
  bodyCount,
  totalMax,
  jsonOverhead,
  className,
}: ArticleCharacterBreakdownProps) {
  // Calculate dynamic body max: total - json overhead - current title length
  const bodyMax = totalMax - jsonOverhead - titleCount;
  const totalCount = titleCount + bodyCount + jsonOverhead;
  const percentage = totalCount / totalMax;

  const isWarning = percentage >= WARNING_THRESHOLD && percentage < DANGER_THRESHOLD;
  const isDanger = percentage >= DANGER_THRESHOLD;

  const getColorClass = (count: number, max: number) => {
    const pct = count / max;
    if (pct >= DANGER_THRESHOLD) return 'text-destructive font-bold';
    if (pct >= WARNING_THRESHOLD) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  return (
    <Atoms.Container
      overrideDefaults
      className={Libs.cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md bg-card/50 px-3 py-2 text-xs',
        className,
      )}
      data-cy="article-character-breakdown"
    >
      {/* Title */}
      <Atoms.Container overrideDefaults className="flex items-center gap-1">
        <Atoms.Typography as="span" className="text-muted-foreground" overrideDefaults>
          Title:
        </Atoms.Typography>
        <Atoms.Typography
          as="span"
          className={Libs.cn('tabular-nums', getColorClass(titleCount, titleMax))}
          overrideDefaults
        >
          {titleCount.toLocaleString()}/{titleMax.toLocaleString()}
        </Atoms.Typography>
      </Atoms.Container>

      {/* Body */}
      <Atoms.Container overrideDefaults className="flex items-center gap-1">
        <Atoms.Typography as="span" className="text-muted-foreground" overrideDefaults>
          Body:
        </Atoms.Typography>
        <Atoms.Typography
          as="span"
          className={Libs.cn('tabular-nums', getColorClass(bodyCount, bodyMax))}
          overrideDefaults
        >
          {bodyCount.toLocaleString()}/{bodyMax.toLocaleString()}
        </Atoms.Typography>
      </Atoms.Container>

      {/* JSON overhead */}
      <Atoms.Container overrideDefaults className="flex items-center gap-1">
        <Atoms.Typography as="span" className="text-muted-foreground" overrideDefaults>
          JSON:
        </Atoms.Typography>
        <Atoms.Typography as="span" className="text-muted-foreground tabular-nums" overrideDefaults>
          +{jsonOverhead}
        </Atoms.Typography>
      </Atoms.Container>

      {/* Separator */}
      <Atoms.Typography as="span" className="text-muted-foreground/50" overrideDefaults>
        │
      </Atoms.Typography>

      {/* Total */}
      <Atoms.Container overrideDefaults className="flex items-center gap-1">
        <Atoms.Typography as="span" className="font-medium text-foreground" overrideDefaults>
          Total:
        </Atoms.Typography>
        <Atoms.Typography
          as="span"
          className={Libs.cn(
            'font-medium tabular-nums',
            isDanger && 'font-bold text-destructive',
            isWarning && 'text-yellow-500',
            !isWarning && !isDanger && 'text-foreground',
          )}
          overrideDefaults
        >
          {totalCount.toLocaleString()}/{totalMax.toLocaleString()}
        </Atoms.Typography>
        {/* Show remaining when close to limit but not over */}
        {isDanger && totalCount <= totalMax && (
          <Atoms.Typography as="span" className="text-destructive" overrideDefaults>
            ({(totalMax - totalCount).toLocaleString()} left)
          </Atoms.Typography>
        )}
        {/* Show how many to delete when over limit */}
        {totalCount > totalMax && (
          <Atoms.Typography as="span" className="font-bold text-destructive" overrideDefaults>
            (delete {(totalCount - totalMax).toLocaleString()})
          </Atoms.Typography>
        )}
      </Atoms.Container>
    </Atoms.Container>
  );
}
