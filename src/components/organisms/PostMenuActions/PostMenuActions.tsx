'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Organisms from '@/organisms';
import type { PostMenuActionsProps } from './PostMenuActions.types';

export type { PostMenuActionsProps };

export function PostMenuActions({ postId, trigger }: PostMenuActionsProps) {
  const isMobile = Hooks.useIsMobile();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    // Remove focus from trigger after a short delay to allow menu to close
    setTimeout(() => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.blur) {
        activeElement.blur();
      }
    }, 100);
  };

  if (isMobile) {
    return (
      <Atoms.Sheet open={open} onOpenChange={setOpen}>
        <Atoms.SheetTrigger asChild>{trigger}</Atoms.SheetTrigger>
        <Atoms.SheetContent side="bottom" onOpenAutoFocus={(e) => e.preventDefault()}>
          <Atoms.SheetHeader>
            <Atoms.SheetTitle className="sr-only">Post Actions</Atoms.SheetTitle>
          </Atoms.SheetHeader>
          <Atoms.Container overrideDefaults className="mt-4 flex flex-col gap-2.5">
            <Organisms.PostMenuActionsContent postId={postId} variant="sheet" onActionComplete={handleClose} />
          </Atoms.Container>
        </Atoms.SheetContent>
      </Atoms.Sheet>
    );
  }

  // Desktop: DropdownMenu
  return (
    <Atoms.DropdownMenu open={open} onOpenChange={setOpen}>
      <Atoms.DropdownMenuTrigger asChild>{trigger}</Atoms.DropdownMenuTrigger>
      <Atoms.DropdownMenuContent
        align="end"
        className="flex w-56 flex-col gap-2.5"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          handleClose();
        }}
      >
        <Organisms.PostMenuActionsContent postId={postId} variant="dropdown" onActionComplete={handleClose} />
      </Atoms.DropdownMenuContent>
    </Atoms.DropdownMenu>
  );
}
