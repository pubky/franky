'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import * as Providers from '@/providers';

/**
 * ProfileTagged Organism
 *
 * Handles all data fetching and state management for the tagged section.
 * This organism is responsible for:
 * - Fetching user profile data
 * - Fetching and managing tags
 * - Handling tag add/toggle operations
 * - Managing loading and empty states
 * Uses ProfileContext to get the target user's pubky.
 */
export function ProfileTagged(): React.ReactElement {
  // Get the profile pubky from context
  const { pubky } = Providers.useProfileContext();

  // Get user profile data for the target user
  const { profile } = Hooks.useUserProfile(pubky ?? '');

  const { tags, count, isLoading, handleTagAdd, handleTagToggle, hasMore, isLoadingMore, loadMore } =
    Hooks.useTagged(pubky);

  const userName = profile?.name || '';

  // Show loading state while fetching initial data
  if (isLoading) {
    return (
      <Atoms.Container className="flex items-center justify-center gap-3">
        <Atoms.Spinner size="md" />
        <Atoms.Typography as="p" className="text-muted-foreground">
          Loading tags...
        </Atoms.Typography>
      </Atoms.Container>
    );
  }

  // Show empty state only after loading is complete and there are no tags
  if (tags.length === 0) {
    return <Molecules.TaggedEmpty onTagAdd={handleTagAdd} />;
  }

  return (
    <Atoms.Container className="gap-3">
      <Atoms.Heading level={5} size="lg" className="leading-normal font-light text-muted-foreground lg:hidden">
        Tagged ({count})
      </Atoms.Heading>
      <Molecules.TaggedSection
        tags={tags}
        userName={userName}
        handleTagAdd={handleTagAdd}
        handleTagToggle={handleTagToggle}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        loadMore={loadMore}
      />
    </Atoms.Container>
  );
}
