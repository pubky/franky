'use client';

import * as Libs from '@/libs';
import * as Molecules from '@/molecules';

/**
 * Search Empty State Component
 *
 * Displayed when no tags are provided in the URL.
 * Guides the user on how to search for posts.
 */
export function SearchEmptyState(): React.ReactElement {
  return (
    <Molecules.ProfilePageEmptyState
      imageSrc="/images/tagged-empty-state.png"
      imageAlt="Search - Empty state"
      icon={Libs.Search}
      title="Search for posts by tags"
      subtitle={
        <>
          Use the search bar or click on a tag to discover posts.
          <br />
          You can search for multiple tags separated by commas.
        </>
      }
    />
  );
}
