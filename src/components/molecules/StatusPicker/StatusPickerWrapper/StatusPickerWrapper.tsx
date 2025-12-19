'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Icons from '@/libs/icons';
import * as Molecules from '@/molecules';
import * as Types from './index';

export function StatusPickerWrapper({
  emoji,
  status,
  onStatusChange,
  sideOffset = Types.DEFAULT_POPOVER_SIDE_OFFSET,
}: Types.StatusPickerWrapperProps) {
  const [open, setOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const isMobile = Hooks.useIsMobile();

  // Use local status if set, otherwise use prop
  const currentStatus = localStatus ?? status;
  const parsed = Libs.parseStatus(currentStatus, emoji);

  const handleStatusSelect = (selectedStatus: string) => {
    setLocalStatus(selectedStatus);
    onStatusChange?.(selectedStatus);
    setOpen(false);
  };

  const triggerButton = (
    <Atoms.Button
      variant="ghost"
      overrideDefaults={true}
      className="flex h-8 cursor-pointer items-center gap-1 p-0 focus-visible:border-none focus-visible:ring-0 focus-visible:outline-none"
    >
      <span className="text-base leading-6">{parsed.emoji}</span>
      <span className="text-base leading-6 font-bold text-white">{parsed.text}</span>
      <Icons.ChevronDown className={Libs.cn('size-6 transition-transform duration-300', open && 'rotate-180')} />
    </Atoms.Button>
  );

  if (isMobile) {
    return (
      <Atoms.Sheet open={open} onOpenChange={setOpen}>
        <Atoms.SheetTrigger asChild>{triggerButton}</Atoms.SheetTrigger>
        <Atoms.SheetContent side="bottom" onOpenAutoFocus={(e) => e.preventDefault()}>
          <Atoms.SheetHeader>
            <Atoms.SheetTitle>Select Status</Atoms.SheetTitle>
            <Atoms.SheetDescription className="sr-only">
              Choose a status to display on your profile
            </Atoms.SheetDescription>
          </Atoms.SheetHeader>
          <Atoms.Container overrideDefaults className="mt-4">
            <Molecules.StatusPickerContent onStatusSelect={handleStatusSelect} currentStatus={currentStatus} />
          </Atoms.Container>
        </Atoms.SheetContent>
      </Atoms.Sheet>
    );
  }

  return (
    <Atoms.Popover open={open} onOpenChange={setOpen}>
      <Atoms.PopoverTrigger asChild>{triggerButton}</Atoms.PopoverTrigger>
      <Atoms.PopoverContent
        className="w-(--popover-width)"
        sideOffset={sideOffset}
        side="top"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Molecules.StatusPickerContent onStatusSelect={handleStatusSelect} currentStatus={currentStatus} />
      </Atoms.PopoverContent>
    </Atoms.Popover>
  );
}
