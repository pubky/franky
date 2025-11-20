'use client';

import { useState, useEffect } from 'react';
import * as Atoms from '@/components/atoms';
import * as Icons from '@/libs/icons';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import { StatusPickerContent } from '../StatusPickerContent';
import { parseStatus } from '../statusUtils';

export interface StatusPickerWrapperProps {
  emoji: string;
  status: string;
  onStatusChange?: (status: string) => void;
}

export function StatusPickerWrapper({ emoji, status, onStatusChange }: StatusPickerWrapperProps) {
  const [open, setOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [sideOffset, setSideOffset] = useState(-30); // Default fallback
  const isMobile = Hooks.useIsMobile();

  // Read CSS variable for side offset
  useEffect(() => {
    const root = document.documentElement;
    const offsetValue = getComputedStyle(root).getPropertyValue('--popover-side-offset').trim();
    if (offsetValue) {
      // Parse "-30px" to -30
      const numericValue = parseInt(offsetValue, 10);
      if (!isNaN(numericValue)) {
        setSideOffset(numericValue);
      }
    }
  }, []);

  // Use local status if set, otherwise use prop
  const currentStatus = localStatus ?? status;
  const parsed = parseStatus(currentStatus, emoji);

  const handleStatusSelect = (selectedStatus: string) => {
    setLocalStatus(selectedStatus);
    onStatusChange?.(selectedStatus);
    setOpen(false);
  };

  const triggerButton = (
    <Atoms.Button
      variant="ghost"
      size="sm"
      className="focus-visible:border-none focus-visible:ring-0 focus-visible:outline-none"
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
      <Atoms.Sheet open={open} onOpenChange={setOpen}>
        <Atoms.SheetTrigger asChild>{triggerButton}</Atoms.SheetTrigger>
        <Atoms.SheetContent side="bottom">
          <Atoms.SheetHeader>
            <Atoms.SheetTitle>Select Status</Atoms.SheetTitle>
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
        sideOffset={sideOffset} // Uses --popover-side-offset CSS variable
        side="top" // Position above the trigger
        align="start" // Align to start (left) of trigger
      >
        <StatusPickerContent onStatusSelect={handleStatusSelect} currentStatus={currentStatus} />
      </Atoms.PopoverContent>
    </Atoms.Popover>
  );
}
