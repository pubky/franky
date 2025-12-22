import * as Core from '@/core';

/**
 * Recent user search item data
 * Matches Core.RecentUserSearch from search store
 */
export type RecentUserSearchItem = Core.RecentUserSearch;

/**
 * Recent tag search item data
 * Matches Core.RecentTagSearch from search store
 */
export type RecentTagSearchItem = Core.RecentTagSearch;

/**
 * Props for SearchRecentUserItem component
 */
export interface SearchRecentUserItemProps {
  /** User data */
  user: RecentUserSearchItem;
  /** Callback when user item is clicked */
  onClick: (userId: Core.Pubky) => void;
}
