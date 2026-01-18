'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import type { PostHeaderUserInfoPopoverWrapperProps } from './PostHeaderUserInfoPopoverWrapper.types';
import {
  POPOVER_ALIGN_OFFSET,
  POPOVER_HOVER_DELAY,
  POPOVER_SIDE_OFFSET,
} from './PostHeaderUserInfoPopoverWrapper.constants';
import { PostHeaderUserInfoPopoverContent } from './components/PostHeaderUserInfoPopoverContent/PostHeaderUserInfoPopoverContent';

/**
 * Wrapper component for user info popover that appears on hover.
 *
 * Performance optimization: We use `open` state to conditionally render the content
 * only when the popover is actually visible. This prevents loading all hooks and
 * data fetching for every user on the timeline, which would cause significant
 * performance degradation. Instead, we only fetch and render user data when the
 * user hovers over a post header.
 */
export function PostHeaderUserInfoPopoverWrapper({
  userId,
  userName,
  avatarUrl,
  formattedPublicKey,
  children,
}: PostHeaderUserInfoPopoverWrapperProps) {
  const [open, setOpen] = useState(false);

  return (
    <Atoms.Popover hover hoverDelay={POPOVER_HOVER_DELAY} open={open} onOpenChange={setOpen}>
      <Atoms.PopoverTrigger asChild>{children}</Atoms.PopoverTrigger>
      <Atoms.PopoverContent
        side="top"
        sideOffset={POPOVER_SIDE_OFFSET}
        align="start"
        alignOffset={POPOVER_ALIGN_OFFSET}
        className="mx-0 w-(--popover-width)"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {open ? (
          <PostHeaderUserInfoPopoverContent
            userId={userId}
            userName={userName}
            avatarUrl={avatarUrl}
            formattedPublicKey={formattedPublicKey}
          />
        ) : null}
      </Atoms.PopoverContent>
    </Atoms.Popover>
  );
}
