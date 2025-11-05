'use client';

import { useState } from 'react';
import * as Organisms from '@/organisms';

function IconPlus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      className={className}
    >
      <path
        d="M8.33398 20H31.6673M20.0007 8.33331V31.6667"
        stroke="white"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FloatingActionButton() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className="fixed bottom-10 right-10 z-50 flex items-center justify-center w-20 h-20 rounded-full bg-white/12 backdrop-blur-lg border border-border shadow-[0px_20px_25px_rgba(5,5,10,0.5),0px_8px_10px_rgba(5,5,10,0.25)] hover:bg-white/16 transition-all duration-200"
        aria-label="Create new post"
      >
        <IconPlus className="h-10 flex-[1_0_0] aspect-square" />
      </button>
      <Organisms.DialogNewPost open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
