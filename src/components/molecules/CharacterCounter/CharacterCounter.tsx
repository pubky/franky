'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface CharacterCounterProps {
  /** Current character count */
  count: number;
  /** Maximum allowed characters */
  max: number;
  /** Optional label to display before the counter */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Threshold percentages for warning states
 * - Below WARNING_THRESHOLD: normal (muted)
 * - Between WARNING and DANGER: warning (yellow)
 * - Above DANGER_THRESHOLD: danger (red)
 */
const WARNING_THRESHOLD = 0.8; // 80%
const DANGER_THRESHOLD = 0.95; // 95%

/**
 * CharacterCounter molecule
 *
 * Displays a character count with visual feedback based on usage:
 * - Normal state: muted text color
 * - Warning state (80%+): yellow/amber color
 * - Danger state (95%+): red color with emphasis
 *
 * @example
 * ```tsx
 * <CharacterCounter count={1500} max={2000} />
 * <CharacterCounter count={45000} max={50000} label="Body" />
 * ```
 */
export function CharacterCounter({ count, max, label, className }: CharacterCounterProps) {
  const percentage = count / max;
  const remaining = max - count;

  // Determine visual state based on percentage
  const isWarning = percentage >= WARNING_THRESHOLD && percentage < DANGER_THRESHOLD;
  const isDanger = percentage >= DANGER_THRESHOLD;

  return (
    <Atoms.Container
      overrideDefaults
      className={Libs.cn('flex items-center gap-1.5', className)}
      data-cy="character-counter"
    >
      {label && (
        <Atoms.Typography as="span" className="text-xs font-medium text-muted-foreground" overrideDefaults>
          {label}:
        </Atoms.Typography>
      )}
      <Atoms.Typography
        as="span"
        className={Libs.cn(
          'text-xs font-medium tabular-nums transition-colors',
          isDanger && 'font-bold text-destructive',
          isWarning && 'text-yellow-500',
          !isWarning && !isDanger && 'text-muted-foreground',
        )}
        overrideDefaults
        data-cy="character-counter-value"
      >
        {count.toLocaleString()}/{max.toLocaleString()}
      </Atoms.Typography>
      {isDanger && remaining >= 0 && (
        <Atoms.Typography as="span" className="text-xs font-medium text-destructive" overrideDefaults>
          ({remaining.toLocaleString()} left)
        </Atoms.Typography>
      )}
      {remaining < 0 && (
        <Atoms.Typography as="span" className="text-xs font-bold text-destructive" overrideDefaults>
          (over limit!)
        </Atoms.Typography>
      )}
    </Atoms.Container>
  );
}
