'use client';

import Image from 'next/image';
import { UserRoundPlus } from 'lucide-react';
import * as Atoms from '@/atoms';

interface UserConnectionsEmptyProps {
  title: string;
  description: string | React.ReactNode;
  showActionButtons?: boolean;
  onWhoToFollow?: () => void;
  onPopularUsers?: () => void;
}

export function UserConnectionsEmpty({
  title,
  description,
  showActionButtons = false,
  onWhoToFollow,
  onPopularUsers,
}: UserConnectionsEmptyProps) {
  return (
    <Atoms.Container className="relative flex flex-col items-center justify-center gap-6 p-6">
      {/* Background image */}
      <Image
        src="/images/followers-empty-state.png"
        alt="Empty state"
        fill
        className="pointer-events-none object-contain object-center"
        aria-hidden="true"
      />

      {/* UserRoundPlus icon */}
      <Atoms.Container
        overrideDefaults={true}
        className="relative z-10 flex shrink-0 items-center justify-center rounded-full bg-brand/16 p-6"
      >
        <UserRoundPlus className="size-12 text-brand" strokeWidth={1.5} />
      </Atoms.Container>

      {/* Title */}
      <Atoms.Container
        overrideDefaults={true}
        className="relative z-10 flex w-full flex-col items-center justify-center"
      >
        <Atoms.Typography as="h3" size="lg" className="pb-6 text-center leading-8 font-bold">
          {title}
        </Atoms.Typography>
        {typeof description === 'string' ? (
          <Atoms.Typography as="p" className="text-center text-base leading-6 font-medium text-secondary-foreground">
            {description}
          </Atoms.Typography>
        ) : (
          description
        )}
      </Atoms.Container>

      {/* Action Buttons */}
      {showActionButtons && (
        <Atoms.Container
          overrideDefaults={true}
          className="relative z-10 flex flex-col items-center justify-center gap-3 lg:flex-row"
        >
          <Atoms.Button variant="secondary" size="sm" className="h-10 gap-2 px-4" onClick={onWhoToFollow}>
            <UserRoundPlus className="size-4" />
            <span>Who to Follow</span>
          </Atoms.Button>
          <Atoms.Button variant="secondary" size="sm" className="h-10 gap-2 px-4" onClick={onPopularUsers}>
            <UserRoundPlus className="size-4" />
            <span>Popular Users</span>
          </Atoms.Button>
        </Atoms.Container>
      )}
    </Atoms.Container>
  );
}
