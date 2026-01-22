import type { Pubky } from '@/core';
import type { AutocompleteUserData } from '@/hooks/useUserDetailsFromIds';

export interface SearchUserSuggestionProps {
  /** User data */
  user: AutocompleteUserData;
  /** Callback when user is clicked */
  onClick?: (userId: Pubky) => void;
}
