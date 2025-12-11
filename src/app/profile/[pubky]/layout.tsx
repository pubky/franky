'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import * as Organisms from '@/organisms';
import * as Providers from '@/providers';
import * as Core from '@/core';

/**
 * DynamicProfileLayout - Next.js layout for viewing other users' profiles
 *
 * This layout wraps children with ProfileProvider using the pubky from URL params.
 * Used for routes like /profile/{pubky}/followers, /profile/{pubky}/posts, etc.
 *
 * @see {@link ProfilePageContainer} for business logic
 * @see {@link ProfilePageLayout} for presentation
 */
export default function DynamicProfileLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  const params = useParams();
  const pubky = params.pubky as Core.Pubky;

  return (
    <Providers.ProfileProvider pubky={pubky}>
      <Organisms.ProfilePageContainer>{children}</Organisms.ProfilePageContainer>
    </Providers.ProfileProvider>
  );
}
