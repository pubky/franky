import * as React from 'react';
import * as Organisms from '@/organisms';

/**
 * ProfileLayout - Next.js layout for profile pages
 *
 * This layout is now a simple wrapper that delegates all business logic
 * to the ProfilePageContainer (smart component), which in turn delegates
 * presentation to ProfilePageLayout (dumb component).
 *
 * Benefits of this separation:
 * 1. Layout is truly "dumb plumbing" - no business logic
 * 2. Easier to test (container can be tested independently)
 * 3. Better separation of concerns (smart vs. dumb components)
 * 4. Follows single responsibility principle
 * 5. Auth state and data fetching are encapsulated in container
 *
 * @see {@link ProfilePageContainer} for business logic
 * @see {@link ProfilePageLayout} for presentation
 */
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <Organisms.ProfilePageContainer>{children}</Organisms.ProfilePageContainer>;
}
