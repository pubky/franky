'use client';

import * as Libs from '@/libs';

export interface SettingsLoaderProps {
  className?: string;
}

export function SettingsLoader({ className }: SettingsLoaderProps) {
  return (
    <div
      className={Libs.cn(
        'p-8 md:p-12 bg-white/10 rounded-lg flex-col justify-start items-start gap-12 inline-flex',
        className,
      )}
    >
      <div className="w-full flex flex-col gap-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-foreground/10 rounded animate-pulse [animation-duration:1.5s]" />
          <div className="h-8 w-48 bg-foreground/10 rounded animate-pulse [animation-duration:1.5s]" />
        </div>

        {/* Description skeleton */}
        <div className="h-6 w-full max-w-2xl bg-foreground/10 rounded animate-pulse [animation-duration:1.5s]" />

        {/* Content skeleton */}
        <div className="w-full p-6 bg-white/5 rounded-2xl flex-col gap-4 flex">
          <div className="h-8 w-full bg-foreground/10 rounded animate-pulse [animation-duration:1.5s]" />
          <div className="h-8 w-full bg-foreground/10 rounded animate-pulse [animation-duration:1.5s] [animation-delay:0.1s]" />
          <div className="h-8 w-3/4 bg-foreground/10 rounded animate-pulse [animation-duration:1.5s] [animation-delay:0.2s]" />
        </div>
      </div>
    </div>
  );
}
