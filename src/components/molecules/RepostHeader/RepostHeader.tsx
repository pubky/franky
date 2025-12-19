'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import type { RepostHeaderProps } from './RepostHeader.types';

/**
 * RepostHeader
 *
 * Header bar displayed on top of reposts made by the current user.
 * Shows "You reposted" with a repeat icon and an undo button to delete the repost.
 * Only shown on actual reposts (not in repost previews).
 */
export function RepostHeader({ onUndo, isUndoing = false }: RepostHeaderProps) {
  return (
    <Atoms.Container
      className="flex items-center justify-between rounded-t-md bg-muted px-4 py-3"
      overrideDefaults
      data-testid="repost-header"
    >
      <Atoms.Container className="flex items-center gap-3" overrideDefaults>
        <Libs.Repeat className="size-5" aria-label="Repeat" />
        <Atoms.Typography as="span" className="text-base font-bold text-foreground" overrideDefaults>
          You reposted
        </Atoms.Typography>
      </Atoms.Container>
      <Atoms.Button
        variant="ghost"
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          onUndo();
        }}
        disabled={isUndoing}
        className="h-auto px-0 text-destructive hover:bg-transparent hover:text-destructive"
        aria-label={isUndoing ? 'Undoing repost...' : 'Undo repost'}
        data-testid="repost-undo-button"
      >
        {isUndoing ? 'Undoing...' : 'Undo repost'}
      </Atoms.Button>
    </Atoms.Container>
  );
}
