import type { SearchTag } from '@/molecules/SearchTagSection/SearchTagSection.types';

export interface SearchSuggestionsProps {
  hotTags: SearchTag[];
  onTagClick: (tag: string) => void;
}
