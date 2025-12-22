import type { Pubky } from '@/core';
import type { HotTag } from '@/hooks/useHotTags/useHotTags.types';
import type { AutocompleteTag } from '@/hooks/useSearchAutocomplete/useSearchAutocomplete.types';
import type { AutocompleteUserData } from '@/hooks/useSearchAutocomplete/useSearchAutocomplete.types';
import type { RecentUserSearchItem, RecentTagSearchItem } from '../SearchRecentUserItem/SearchRecentUserItem.types';

export interface SearchSuggestionsProps {
  /** ID for ARIA relationship with input */
  id?: string;
  /** ARIA role for the suggestions container */
  role?: string;
  /** ARIA label for the suggestions container */
  'aria-label'?: string;
  /** Hot tags to display (only when input is empty) */
  hotTags: HotTag[];
  /** Current input value */
  inputValue: string;
  /** Whether input has content */
  hasInput: boolean;
  /** Autocomplete tag suggestions */
  autocompleteTags?: AutocompleteTag[];
  /** Autocomplete user suggestions */
  autocompleteUsers?: AutocompleteUserData[];
  /** Recent user searches */
  recentUsers?: RecentUserSearchItem[];
  /** Recent tag searches */
  recentTags?: RecentTagSearchItem[];
  /** Callback when a tag is clicked */
  onTagClick: (tag: string) => void;
  /** Callback when a user is clicked */
  onUserClick: (userId: Pubky) => void;
  /** Callback when "Search as tag" link is clicked */
  onSearchAsTagClick?: (query: string) => void;
  /** Callback to clear all recent searches */
  onClearRecentSearches?: () => void;
}
