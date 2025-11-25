'use client';

import { Frown } from 'lucide-react';
import * as Atoms from '@/atoms';
import { cn } from '@/libs';

export interface NotificationsEmptyProps {
  className?: string;
}

// Figma image URLs from the empty state designs
const emptyStateImageMobile = 'https://www.figma.com/api/mcp/asset/17c46006-41d1-4e5e-968b-d789aba0ebb4';
const emptyStateImageDesktop = 'https://www.figma.com/api/mcp/asset/74e26d18-20af-4ee2-b3fe-03e50899ec67';

export function NotificationsEmpty({ className }: NotificationsEmptyProps) {
  return (
    <Atoms.Container
      overrideDefaults={true}
      className={cn(
        'flex flex-col items-center justify-center gap-6',
        'h-[250px] rounded-md p-6',
        'w-full max-w-[327px] lg:h-auto lg:max-w-[792px]',
        'relative',
        className,
      )}
    >
      {/* Background image - using img for decorative external images */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={emptyStateImageMobile}
        alt=""
        className="pointer-events-none absolute inset-0 size-full max-w-none rounded-md object-contain object-center lg:hidden"
        aria-hidden="true"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={emptyStateImageDesktop}
        alt=""
        className="pointer-events-none absolute inset-0 hidden size-full max-w-none rounded-md object-contain object-center lg:block"
        aria-hidden="true"
      />

      {/* Icon with brand background */}
      <Atoms.Container
        overrideDefaults={true}
        className="relative z-10 flex shrink-0 items-center justify-center rounded-full bg-brand/16 p-6"
      >
        <Frown className="size-12 text-brand" strokeWidth={1.5} />
      </Atoms.Container>

      {/* Title */}
      <Atoms.Container overrideDefaults={true} className="z-10 flex w-full items-center justify-center gap-2">
        <Atoms.Typography
          as="h3"
          className="flex-1 text-center text-2xl leading-8 font-bold whitespace-pre-wrap text-foreground"
        >
          Nothing to see here yet
        </Atoms.Typography>
      </Atoms.Container>

      {/* Description */}
      <Atoms.Container overrideDefaults={true} className="z-10 flex w-full items-center justify-center gap-2">
        <Atoms.Typography
          as="p"
          className="flex-1 text-center text-base leading-6 font-medium whitespace-pre-wrap text-secondary-foreground"
        >
          Tags, follows, reposts and account information will be displayed here.
        </Atoms.Typography>
      </Atoms.Container>
    </Atoms.Container>
  );
}
