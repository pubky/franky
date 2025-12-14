'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import { PostMenuActionsContent } from './PostMenuActionsContent';
import { POST_MENU_VARIANT } from './PostMenuActions.constants';
import type { PostMenuActionsProps } from './PostMenuActions.types';

export function PostMenuActions({ postId, trigger }: PostMenuActionsProps) {
  const [open, setOpen] = useState(false);
  const isMobile = Hooks.useIsMobile();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (isMobile) {
    return (
      <Atoms.Sheet open={open} onOpenChange={handleOpenChange}>
        <Atoms.SheetTrigger asChild>{trigger}</Atoms.SheetTrigger>
        <Atoms.SheetContent side="bottom" onOpenAutoFocus={(e) => e.preventDefault()}>
          <Atoms.SheetHeader>
            <Atoms.SheetTitle className="sr-only">Post Actions</Atoms.SheetTitle>
            <Atoms.SheetDescription className="sr-only">Choose an action for this post</Atoms.SheetDescription>
          </Atoms.SheetHeader>
          <Atoms.Container overrideDefaults className="mt-4">
            <PostMenuActionsContent postId={postId} onClose={handleClose} variant={POST_MENU_VARIANT.SHEET} />
          </Atoms.Container>
        </Atoms.SheetContent>
      </Atoms.Sheet>
    );
  }

  return (
    <Atoms.DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <Atoms.DropdownMenuTrigger asChild>{trigger}</Atoms.DropdownMenuTrigger>
      <Atoms.DropdownMenuContent
        align="end"
        sideOffset={4}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="min-w-[200px]"
      >
        <PostMenuActionsContent postId={postId} onClose={handleClose} variant={POST_MENU_VARIANT.DROPDOWN} />
      </Atoms.DropdownMenuContent>
    </Atoms.DropdownMenu>
  );
}
