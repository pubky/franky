'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import { MENU_VARIANT } from '@/config/ui';
import * as Hooks from '@/hooks';
import { PostMenuActionsContent } from './PostMenuActionsContent';
import type { PostMenuActionsProps } from './PostMenuActions.types';

export function PostMenuActions({ postId, trigger }: PostMenuActionsProps) {
  const isMobile = Hooks.useIsMobile();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  if (isMobile) {
    return (
      <Atoms.Sheet open={open} onOpenChange={setOpen}>
        <Atoms.SheetTrigger asChild>{trigger}</Atoms.SheetTrigger>
        <Atoms.SheetContent side="bottom" onOpenAutoFocus={(e) => e.preventDefault()}>
          <Atoms.SheetHeader>
            <Atoms.SheetTitle className="sr-only">Post Actions</Atoms.SheetTitle>
          </Atoms.SheetHeader>
          <Atoms.Container overrideDefaults className="flex flex-col gap-2">
            <PostMenuActionsContent postId={postId} variant={MENU_VARIANT.SHEET} onActionComplete={closeMenu} />
          </Atoms.Container>
        </Atoms.SheetContent>
      </Atoms.Sheet>
    );
  }

  return (
    <Atoms.DropdownMenu open={open} onOpenChange={setOpen}>
      <Atoms.DropdownMenuTrigger asChild>{trigger}</Atoms.DropdownMenuTrigger>
      <Atoms.DropdownMenuContent
        align="end"
        className="flex w-56 flex-col gap-2.5"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <PostMenuActionsContent postId={postId} variant={MENU_VARIANT.DROPDOWN} onActionComplete={closeMenu} />
      </Atoms.DropdownMenuContent>
    </Atoms.DropdownMenu>
  );
}
