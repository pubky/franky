'use client';

import { useState } from 'react';
import * as Libs from '@/libs';
import * as Organisms from '@/organisms';

export function FloatingActionButton() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className="cursor-pointer fixed bottom-10 right-10 z-50 flex items-center justify-center w-20 h-20 rounded-full bg-white/12 backdrop-blur-lg border border-border shadow-fab hover:bg-white/16 transition-all duration-200"
        aria-label="Create new post"
      >
        <Libs.Plus className="h-10 w-10 text-white" strokeWidth={1.33} />
      </button>
      <Organisms.DialogNewPost open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
