'use client';

import { Toaster as SonnerToaster } from 'sonner';

import './toaster.css';

/**
 * Shared toast options for both mobile and desktop Toasters.
 */
const sharedToastOptions = {
  unstyled: true,
  classNames: {
    toast:
      'toast-custom flex items-center gap-3 w-[calc(100%-32px)] min-w-0 lg:min-w-[392px] max-w-[392px] rounded-lg border p-4 shadow-lg bg-[#1a1f14] border-brand/32',
    default: 'text-popover-foreground',
    success: 'text-popover-foreground',
    error: '!bg-destructive !border-destructive text-popover-foreground',
    title: 'text-sm font-bold text-popover-foreground line-clamp-1',
    description: 'text-sm text-muted-foreground line-clamp-1',
    actionButton:
      'shrink-0 whitespace-nowrap bg-brand/16 border border-brand text-brand text-xs font-bold px-3 py-2 rounded-full shadow-xs',
    cancelButton:
      'shrink-0 whitespace-nowrap bg-popover/80 text-secondary-foreground text-xs font-bold px-3 py-2 rounded-full',
  },
  duration: 8000,
};

/**
 * Custom Toaster component using Sonner with Figma design styles.
 *
 * - Desktop (lg+): bottom-center, min-width 392px, offset 80px above footer
 * - Mobile: top-center, below header (96px = 80px header + 16px gap)
 *
 * Design references:
 * - Sonner Default (node-id: 193:1386)
 * - Sonner Error (node-id: 25119:70328)
 * - Sonner Action Default/Undo (node-id: 17375:198043)
 * - Sonner Action Secondary/Cancel (node-id: 17375:198042)
 *
 * @see https://www.figma.com/design/01ZvjSPZnKTNmaEWz0yJsq/shadcn_ui-PUBKY?node-id=302-6032&m=dev
 */
export function Toaster() {
  return (
    <>
      {/* Mobile: top position, below header */}
      <SonnerToaster
        position="top-center"
        offset={96} // Below MobileHeader (80px + 16px gap)
        toastOptions={sharedToastOptions}
        className="toaster-mobile lg:hidden"
      />
      {/* Desktop: bottom position, above footer */}
      <SonnerToaster
        position="bottom-center"
        offset={80} // Above MobileFooter (64px + 16px gap)
        toastOptions={sharedToastOptions}
        className="toaster-desktop hidden lg:block"
      />
    </>
  );
}
