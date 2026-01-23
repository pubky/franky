'use client';

import Image from 'next/image';
import Link from 'next/link';
import { UserX, Home } from 'lucide-react';
import * as Atoms from '@/atoms';

/**
 * ProfileNotFound - Displayed when a user profile does not exist
 *
 * This component is shown when navigating to a profile page for a user
 * that doesn't exist in the system (e.g., /profile/invalidpublickey).
 */
export function ProfileNotFound() {
  return (
    <Atoms.Container data-cy="profile-not-found" className="relative items-center gap-6 px-0 py-6">
      {/* Background image */}
      <Image
        src="/images/connections-empty-state.png"
        alt="User not found"
        fill
        className="pointer-events-none object-contain object-center"
        aria-hidden="true"
      />

      {/* Icon */}
      <Atoms.Container overrideDefaults={true} className="flex items-center rounded-full bg-brand/16 p-6">
        <UserX className="size-12 text-brand" strokeWidth={1.5} />
      </Atoms.Container>

      {/* Title and subtitle */}
      <Atoms.Container className="items-center gap-6">
        <Atoms.Typography as="h3" size="lg">
          User not found
        </Atoms.Typography>

        <Atoms.Typography className="text-center text-base leading-6 font-medium text-secondary-foreground">
          The user you are looking for does not exist.
          <br />
          They may have been removed or the link might be incorrect.
        </Atoms.Typography>
      </Atoms.Container>

      {/* CTA */}
      <Link href="/">
        <Atoms.Button variant="default" size="default" className="gap-2">
          <Home className="size-4" />
          <Atoms.Typography as="span" overrideDefaults={true}>
            Go to Home
          </Atoms.Typography>
        </Atoms.Button>
      </Link>
    </Atoms.Container>
  );
}
