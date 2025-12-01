'use client';

import * as React from 'react';
import * as Core from '@/core';
import * as Hooks from '@/hooks';
import * as Organisms from '@/organisms';

export interface ProfilePageContainerProps {
  /** Child pages to render in the main content area */
  children: React.ReactNode;
}

/**
 * ProfilePageContainer - Smart component that handles business logic for profile pages
 *
 * This container is responsible for:
 * - Authentication state management (fetching current user)
 * - Data fetching (profile, stats)
 * - Navigation state (active pages, routing)
 * - Action handlers (edit, copy, sign out, etc.)
 *
 * It delegates presentation concerns to ProfilePageLayout, which is a dumb component
 * that only receives props and renders UI.
 *
 * This separation follows the container/presentation pattern:
 * - Container (this): Smart, handles logic, connects to stores/hooks
 * - Presentation (ProfilePageLayout): Dumb, receives props, renders UI
 *
 * @example
 * ```tsx
 * // In app/profile/layout.tsx
 * export default function ProfileLayout({ children }) {
 *   return (
 *     <ProfilePageContainer>
 *       {children}
 *     </ProfilePageContainer>
 *   );
 * }
 * ```
 */
export function ProfilePageContainer({ children }: ProfilePageContainerProps) {
  // Business logic: Get current authenticated user
  const { currentUserPubky } = Core.useAuthStore();

  // Business logic: Fetch profile data and stats
  // Note: useProfileHeader guarantees a non-null profile with default values during loading
  const { profile, stats, actions, isLoading } = Hooks.useProfileHeader(currentUserPubky ?? '');

  // Business logic: Handle navigation state
  const { activePage, filterBarActivePage, navigateToPage } = Hooks.useProfileNavigation();

  // Delegate presentation to layout organism
  return (
    <Organisms.ProfilePageLayout
      profile={profile}
      stats={stats}
      actions={actions}
      activePage={activePage}
      filterBarActivePage={filterBarActivePage}
      navigateToPage={navigateToPage}
      isLoading={isLoading}
    >
      {children}
    </Organisms.ProfilePageLayout>
  );
}
