import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import type { SearchSuggestionsProps } from './SearchSuggestions.types';

export function SearchSuggestions({ hotTags, onTagClick }: SearchSuggestionsProps) {
  return (
    <Atoms.Container
      data-testid="search-suggestions"
      className="absolute top-full right-0 left-0 z-50 rounded-b-2xl border border-t-0 border-border"
      style={Organisms.SEARCH_EXPANDED_STYLE}
      overrideDefaults
    >
      <Atoms.Container className="gap-6 p-6">
        <Molecules.SearchTagSection title="Hot tags" tags={hotTags} onTagClick={onTagClick} />
        {/*The next section comes here*/}
      </Atoms.Container>
    </Atoms.Container>
  );
}
