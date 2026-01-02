import type { Pubky } from '@/core';
import type { AutocompleteUserData } from '@/hooks/useSearchAutocomplete/useSearchAutocomplete.types';

export interface SearchUserSuggestionProps {
  /** User data */
  user: AutocompleteUserData;
  /** Callback when user is clicked */
  onClick?: (userId: Pubky) => void;
}
