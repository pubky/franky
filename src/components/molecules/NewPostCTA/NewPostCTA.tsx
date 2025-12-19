'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Organisms from '@/organisms';

/**
 * Floating Action Button (FAB) for creating new posts.
 *
 * This component only renders for authenticated users to prevent
 * showing a non-functional CTA on public routes like the landing page.
 */
export function NewPostCTA() {
  const [open, setOpen] = useState(false);
  const { isFullyAuthenticated, isLoading } = Hooks.useAuthStatus();

  // Only show FAB for authenticated users
  if (isLoading || !isFullyAuthenticated) {
    return null;
  }

  return (
    <Atoms.Dialog open={open} onOpenChange={setOpen}>
      <Atoms.DialogTrigger asChild>
        {/*
          Positioning:
          - On small screens (sm), the button sits directly on top of the menu bar by design.
          - 72px is the current height of the footer navigation bar.
          - md breakpoint uses 80px for additional spacing.
          - TODO: The footer navbar should be refactored; revisit positioning then.
        */}
        <Atoms.Button
          data-cy="new-post-btn"
          overrideDefaults
          data-testid="new-post-cta"
          className={Libs.cn(
            'fixed right-3 bottom-[72px] sm:right-10 md:bottom-20 lg:bottom-6',
            'h-20 w-20 rounded-full',
            'flex items-center justify-center',
            'bg-white/12 backdrop-blur-lg',
            'hover:bg-brand',
            'text-white',
            'shadow-xl transition-colors',
            'group cursor-pointer',
            'z-40',
          )}
          aria-label="New post"
        >
          <Libs.Plus className="h-10 w-10 transition-colors group-hover:text-black" strokeWidth={0.8} />
        </Atoms.Button>
      </Atoms.DialogTrigger>
      <Organisms.DialogNewPost open={open} onOpenChangeAction={setOpen} />
    </Atoms.Dialog>
  );
}
