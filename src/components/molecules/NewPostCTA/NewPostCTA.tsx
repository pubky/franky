'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Organisms from '@/organisms';

export function NewPostCTA() {
  const [open, setOpen] = useState(false);

  return (
    <Atoms.Dialog open={open} onOpenChange={setOpen}>
      <Atoms.DialogTrigger asChild>
        <Atoms.Button
          overrideDefaults
          data-testid="new-post-cta"
          className={Libs.cn(
            'fixed right-3 bottom-6 sm:right-10 sm:bottom-10',
            'h-20 w-20 rounded-full',
            'flex items-center justify-center',
            'bg-secondary hover:bg-brand',
            'text-secondary-foreground',
            'shadow-lg transition-colors',
            'group cursor-pointer',
            'z-40',
          )}
          aria-label="New post"
        >
          <Libs.Plus className="h-6 w-6 transition-colors group-hover:text-black" />
        </Atoms.Button>
      </Atoms.DialogTrigger>
      <Organisms.DialogNewPost open={open} onOpenChangeAction={setOpen} />
    </Atoms.Dialog>
  );
}
