'use client';

import * as Core from '@/core';
import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import type { PostMenuActionsContentProps } from './PostMenuActionsContent.types';

export type { PostMenuActionsContentProps };

// Menu item component that works for both dropdown and sheet
function MenuItem({
  children,
  onClick,
  disabled,
  className,
  variant,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant: 'dropdown' | 'sheet';
}) {
  if (variant === 'sheet') {
    return (
      <Atoms.Button variant="ghost" onClick={onClick} disabled={disabled} className={className}>
        {children}
      </Atoms.Button>
    );
  }
  // For dropdown, use a div (as mocked in tests)
  return (
    <div onClick={disabled ? undefined : onClick} className={className} data-disabled={disabled ? 'true' : 'false'}>
      {children}
    </div>
  );
}

export function PostMenuActionsContent({ postId, variant }: PostMenuActionsContentProps) {
  const { postDetails } = Hooks.usePostDetails(postId);
  const { currentUserPubky } = Hooks.useCurrentUserProfile();

  // Parse post ID to get author
  const parsedId = Core.parseCompositeId(postId);
  const postAuthorId = parsedId.pubky;
  const isOwnPost = currentUserPubky === postAuthorId;

  // Check if post is an article (kind: 'long')
  const isArticle = postDetails?.kind === 'long';

  const menuItems: React.ReactNode[] = [];

  if (isOwnPost) {
    // Own post menu items
    menuItems.push(
      <MenuItem key="edit" onClick={() => {}} variant={variant}>
        <Atoms.Typography as="span">Edit post</Atoms.Typography>
      </MenuItem>,
    );
    menuItems.push(
      <MenuItem key="delete" onClick={() => {}} variant={variant}>
        <Atoms.Typography as="span">Delete post</Atoms.Typography>
      </MenuItem>,
    );
  } else {
    // Other user post menu items
    menuItems.push(
      <MenuItem key="follow" onClick={() => {}} variant={variant}>
        <Atoms.Typography as="span">Follow</Atoms.Typography>
      </MenuItem>,
    );
    menuItems.push(
      <MenuItem key="mute" onClick={() => {}} variant={variant}>
        <Atoms.Typography as="span">Mute user</Atoms.Typography>
      </MenuItem>,
    );
    menuItems.push(
      <MenuItem key="report" onClick={() => {}} variant={variant}>
        <Atoms.Typography as="span">Report post</Atoms.Typography>
      </MenuItem>,
    );
  }

  // Copy text option (hidden for articles)
  if (!isArticle) {
    menuItems.push(
      <MenuItem key="copy" onClick={() => {}} variant={variant}>
        <Atoms.Typography as="span">Copy text of post</Atoms.Typography>
      </MenuItem>,
    );
  }

  // Both variants return the same structure - wrapper is handled by parent
  return (
    <Atoms.Container overrideDefaults className="flex flex-col">
      {menuItems}
    </Atoms.Container>
  );
}
