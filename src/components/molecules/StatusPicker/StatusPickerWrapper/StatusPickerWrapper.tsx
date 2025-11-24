'use client';

import { useState, useRef } from 'react';
import * as Atoms from '@/components/atoms';
import * as Icons from '@/libs/icons';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import { StatusPickerContent } from '../StatusPickerContent';
import { parseStatus } from '../statusUtils';

// Vertical offset for popover positioning relative to trigger
// Negative value allows popover to overlap with a trigger element
// We cannot use CSS variable here, it resolves to string; a Radix component expects number
const POPOVER_SIDE_OFFSET = -30;

export interface StatusPickerWrapperProps {
  emoji: string;
  status: string;
  onStatusChange?: (status: string) => void;
}

export function StatusPickerWrapper({ emoji, status, onStatusChange }: StatusPickerWrapperProps) {
  const [open, setOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const isMobile = Hooks.useIsMobile();
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Use local status if set, otherwise use prop
  const currentStatus = localStatus ?? status;
  const parsed = parseStatus(currentStatus, emoji);

  // Handle sheet open/close and blur trigger button immediately when opening
  // This prevents the aria-hidden warning by blurring before Radix sets aria-hidden
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Blur trigger button immediately when sheet opens to prevent aria-hidden warning
    if (newOpen && isMobile && triggerRef.current) {
      // Use requestAnimationFrame for immediate execution before Radix sets aria-hidden
      requestAnimationFrame(() => {
        triggerRef.current?.blur();
      });
    }
  };

  const handleStatusSelect = (selectedStatus: string) => {
    setLocalStatus(selectedStatus);
    onStatusChange?.(selectedStatus);
    setOpen(false);
    // Blur the trigger button after status is selected to prevent reopening on Enter
    setTimeout(() => {
      if (triggerRef.current) {
        triggerRef.current.blur();
      }
    }, 0);
  };

  const triggerButton = (
    <Atoms.Button
      ref={triggerRef}
      variant="ghost"
      overrideDefaults={true}
      className="flex h-8 cursor-pointer items-center gap-1.5 p-0 focus-visible:border-none focus-visible:ring-0 focus-visible:outline-none"
    >
      <Atoms.Typography as="span" className="text-base leading-none">
        {parsed.emoji}
      </Atoms.Typography>
      <Atoms.Typography as="span" className="text-base font-bold text-white">
        {parsed.text}
      </Atoms.Typography>
      <Icons.ChevronDown className={Libs.cn('size-6 transition-transform duration-300', open && 'rotate-180')} />
    </Atoms.Button>
  );

  if (isMobile) {
    return (
      <Atoms.Sheet open={open} onOpenChange={handleOpenChange}>
        <Atoms.SheetTrigger asChild>{triggerButton}</Atoms.SheetTrigger>
        <Atoms.SheetContent side="bottom" onOpenAutoFocus={(e) => e.preventDefault()}>
          <Atoms.SheetHeader>
            <Atoms.SheetTitle>Select Status</Atoms.SheetTitle>
            <Atoms.SheetDescription className="sr-only">
              Choose a status to display on your profile
            </Atoms.SheetDescription>
          </Atoms.SheetHeader>
          <Atoms.Container overrideDefaults className="mt-4">
            <StatusPickerContent onStatusSelect={handleStatusSelect} currentStatus={currentStatus} />
          </Atoms.Container>
        </Atoms.SheetContent>
      </Atoms.Sheet>
    );
  }

  return (
    <Atoms.Popover open={open} onOpenChange={setOpen}>
      <Atoms.PopoverTrigger asChild>{triggerButton}</Atoms.PopoverTrigger>
      <Atoms.PopoverContent
        className="w-[var(--popover-width)]"
        sideOffset={POPOVER_SIDE_OFFSET}
        side="top"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <StatusPickerContent onStatusSelect={handleStatusSelect} currentStatus={currentStatus} />
      </Atoms.PopoverContent>
    </Atoms.Popover>
  );
}
